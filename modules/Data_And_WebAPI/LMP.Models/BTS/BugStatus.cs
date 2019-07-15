﻿using System.Collections.Generic;
using System.ComponentModel;
using LMP.Models.Interface;

namespace LMP.Models.BTS
{
    public class BugStatus : ModelBase
    {
        //PROBLEM
        [DisplayName("Статус")] public string Name { get; set; }

        public ICollection<Bug> Bug { get; set; }
    }
}