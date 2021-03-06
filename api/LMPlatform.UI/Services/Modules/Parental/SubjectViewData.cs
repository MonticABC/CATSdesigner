﻿using System.Runtime.Serialization;

namespace LMPlatform.UI.Services.Modules.Parental
{
    using Models;

    [DataContract]
    public class SubjectViewData
    {
	    public SubjectViewData()
	    {
	    }

        public SubjectViewData(Subject subject)
        {
            Id = subject.Id;
            Name = subject.Name;
            ShortName = subject.ShortName;
            IsNeededCopyToBts = subject.IsNeededCopyToBts;
            Color = subject.Color;
        }

        [DataMember]
        public int Id { get; set; }

        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public string ShortName { get; set; }

        [DataMember]
        public bool IsNeededCopyToBts { get; set; }

        [DataMember]
        public string Color { get; set; }

        [DataMember]
        public LectorViewData Lector { get; set; }
    }
}
