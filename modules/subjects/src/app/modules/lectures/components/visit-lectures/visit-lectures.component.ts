import { loadGroups } from './../../../../store/actions/groups.actions';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {MatOptionSelectionChange} from "@angular/material/core";
import {Calendar} from '../../../../models/calendar.model';
import {LecturesService} from "../../../../services/lectures/lectures.service";
import {Group} from "../../../../models/group.model";
import {GroupsVisiting, LecturesMarksVisiting} from "../../../../models/groupsVisiting.model";
import {GroupsService} from '../../../../services/groups/groups.service';
import {DialogData} from '../../../../models/dialog-data.model';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {VisitDatePopoverComponent} from '../../../../shared/visit-date-popover/visit-date-popover.component';
import {ComponentType} from '@angular/cdk/typings/portal';
import {DeletePopoverComponent} from '../../../../shared/delete-popover/delete-popover.component';
import {VisitingPopoverComponent} from '../../../../shared/visiting-popover/visiting-popover.component';
import { IAppState } from 'src/app/store/state/app.state';
import { Store } from '@ngrx/store';
import * as groupSelectors from '../../../../store/selectors/groups.selectors';
import * as groupActions from '../../../../store/actions/groups.actions';

@Component({
  selector: 'app-visit-lectures',
  templateUrl: './visit-lectures.component.html',
  styleUrls: ['./visit-lectures.component.less']
})
export class VisitLecturesComponent implements OnInit, OnDestroy {

  @Input() subjectId: number;
  @Input() isTeacher: boolean;

  public calendar: Calendar[];
  public groups: Group[];
  public groupsVisiting: GroupsVisiting;
  public displayedColumns: string[] = [];
  public selectGroupId: string;

  constructor(
    private store: Store<IAppState>,
              private lecturesService: LecturesService,
              public dialog: MatDialog) {
  }
  ngOnDestroy(): void {
    this.store.dispatch(groupActions.resetGroups());
  }

  ngOnInit() {
    this.store.dispatch(groupActions.loadGroups());
    this.store.select(groupSelectors.getGroups).subscribe(res => {
      this.groups = res;
      this.selectGroupId = res[0].groupId;
    });

    this.lecturesService.loadCalendar();
    this.refreshDataCalendar();

  }

  private refreshDataCalendar() {
    this.lecturesService.getCalendar().subscribe(res => {
      this.calendar = res;
      this.displayedColumns = ['position', 'name', ...this.calendar.map(res => res.date.toString() + res.id)];
      this.refreshDataGroupVisitMark();
    });
  }

  private refreshDataGroupVisitMark() {
    this.lecturesService.getLecturesMarkVisiting(this.subjectId, this.selectGroupId).subscribe(res => {
      this.groupsVisiting = res ? res[0] : null;
    })
  }

  _selectedGroup(event: MatOptionSelectionChange) {
    if (event.isUserInput) {
      this.selectGroupId = event.source.value;
      this.refreshDataGroupVisitMark();
    }
  }

  deleteAllDate() {
    const dateIds = [];
    this.calendar.forEach(res => {
      dateIds.push(res.id);
    });
    this.lecturesService.deleteAllDate({dateIds});
  }

  settingVisitDate() {
    const dialogData: DialogData = {
      title: 'График занятий',
      buttonText: 'Добавить',
      body: {service: this.lecturesService, restBody: {subjectId: this.subjectId}},
    };

    this.openDialog(dialogData, VisitDatePopoverComponent);
  }

  deletePopover() {
    const dialogData: DialogData = {
      title: 'Удаление дат',
      body: 'даты и все связанные с ними данные',
      buttonText: 'Удалить'
    };
    const dialogRef = this.openDialog(dialogData, DeletePopoverComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteAllDate();
      }
    });
  }

  setVisitMarks(date, index): void {
    if (this.isTeacher) {
      const visits = {
        date: date.date,
        students: this.groupsVisiting.lecturesMarksVisiting.map(res => ({
          name: res.StudentName,
          mark: res.Marks[index].Mark,
          comment: res.Marks[index].Comment
        }))
      };

      const dialogData: DialogData = {
        title: 'Посещаемость студентов',
        buttonText: 'Сохранить',
        body: visits
      };
      const dialogRef = this.openDialog(dialogData, VisitingPopoverComponent);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.lecturesService.setLecturesVisitingDate(
            {lecturesMarks: this.getModelVisitLabs(this.groupsVisiting.lecturesMarksVisiting, index, result.students)})
        }
      });
    }
  }

  getModelVisitLabs(lecturesMarksVisiting: LecturesMarksVisiting[], index, visits) {
    for (let i = 0; i < visits.length; i++) {
      lecturesMarksVisiting[i].Marks[index].Mark = visits[i].mark ? visits[i].mark.toString() : '';
      lecturesMarksVisiting[i].Marks[index].Comment = visits[i].comment ? visits[i].comment.toString() : '';

    }
    return lecturesMarksVisiting
  }

  openDialog(data: DialogData, popover: ComponentType<any>): MatDialogRef<any> {
    return this.dialog.open(popover, {data});
  }

  getExcelFile() {
    location.href = 'http://localhost:8080/Statistic/GetVisitLecture?subjectId=' + this.subjectId + '&groupId=' + this.selectGroupId;
  }

}
