import { Component, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { TranslateDirective, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { Technologies } from '../shared/data/projects';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
import { EmailDialogComponent } from './dialog/email-dialog.component';
import { Language } from '../app.component';

interface AboutMe {
  name: string;
  info: Info;
  email: string;
  github: string;
  linkedin: string;
  education: Array<Education>;
  jobs: Array<Job>;
}
interface Education {
  title: string;
  school: School;
  date: string;
  icon: string;
}
interface School {
  name: string;
  specialization: string;
}
interface Job {
  title: string;
  company: string;
  description: string;
  date: string;
}
interface Info {
  title: string;
  description: string;
}
interface TimelineItem {
  type: 'education' | 'job';
  icon: string;
  title: string;
  subtitle: string;
  detail: string;
  date: string;
  dateShort: string;
  sortYear: number;
  yearLabel: string;
}

@Component({
  selector: 'app-about',
  imports: [MaterialModule, RouterModule, TranslateDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  private dialog = inject(MatDialog);
  private currentLang = 'en';
  constructor() {
    const translate: TranslateService = inject(TranslateService);
    this.currentLang = translate.currentLang || translate.defaultLang || 'en';
    translate.onLangChange.subscribe(e => {
      this.currentLang = e.lang;
      this.buildTimeline();
    });
    translate.stream('education').subscribe((res: Array<Education>) => {
      this.aboutMe.education = res;
      this.buildTimeline();
    });
    translate.stream('about').subscribe((res: Info) => {
      this.aboutMe.info = res;
    });
    translate.stream('jobs').subscribe((res: Array<Job>) => {
      this.aboutMe.jobs = res;
      this.buildTimeline();
    });
  }
  public timelineItems: TimelineItem[] = [];

  private calcDuration(date: string): string {
    const months: Record<string, number> = {
      // English
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
      // Czech
      leden: 0, únor: 1, březen: 2, duben: 3, květen: 4, červen: 5,
      červenec: 6, srpen: 7, září: 8, říjen: 9, listopad: 10, prosinec: 11,
    };

    const parts = date.split(/\s*-\s*/);
    if (parts.length < 2) return date;

    const parseDate = (s: string): Date | null => {
      const tokens = s.trim().toLowerCase().split(/\s+/);
      const year = tokens.find(t => /^\d{4}$/.test(t));
      const month = tokens.find(t => months[t] !== undefined);
      if (!year) return null;
      return new Date(parseInt(year), month ? months[month] : 0);
    };

    const start = parseDate(parts[0]);
    const end = /present|současnost/i.test(parts[1]) ? new Date() : parseDate(parts[1]);
    if (!start || !end) return date;

    let totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (totalMonths < 1) totalMonths = 1;

    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    const isCz = this.currentLang === 'cs';

    const yrShort = isCz ? 'r' : 'yr';
    const moShort = isCz ? 'měs' : 'mo';
    const yearFull = (n: number) => isCz
      ? (n === 1 ? 'rok' : (n >= 2 && n <= 4 ? 'roky' : 'let'))
      : (n === 1 ? 'year' : 'years');
    const monthFull = (n: number) => isCz
      ? (n === 1 ? 'měsíc' : (n >= 2 && n <= 4 ? 'měsíce' : 'měsíců'))
      : (n === 1 ? 'month' : 'months');

    if (years > 0 && remainingMonths > 0) {
      return `${years} ${yrShort} ${remainingMonths} ${moShort}`;
    } else if (years > 0) {
      return `${years} ${yearFull(years)}`;
    } else {
      return `${remainingMonths} ${monthFull(remainingMonths)}`;
    }
  }

  private buildTimeline(): void {
    const items: TimelineItem[] = [];
    for (const edu of this.aboutMe.education) {
      const year = parseInt(edu.date.match(/\d{4}/)?.[0] || '0', 10);
      items.push({
        type: 'education',
        icon: edu.icon,
        title: edu.title,
        subtitle: edu.school.name,
        detail: edu.school.specialization,
        date: edu.date,
        dateShort: this.calcDuration(edu.date),
        sortYear: year,
        yearLabel: String(year),
      });
    }
    for (const job of this.aboutMe.jobs) {
      const year = parseInt(job.date.match(/\d{4}/)?.[0] || '0', 10);
      items.push({
        type: 'job',
        icon: 'work',
        title: job.title,
        subtitle: job.company,
        detail: job.description,
        date: job.date,
        dateShort: this.calcDuration(job.date),
        sortYear: year,
        yearLabel: String(year),
      });
    }
    items.sort((a, b) => a.sortYear - b.sortYear);
    this.timelineItems = items;
  }

  public openPdf(): void {
    this.dialog
      .open(DialogComponent)
      .afterClosed()
      .subscribe((res: Language) => {
        switch (res) {
          case 'cs':
            window.open('pdf/pavel_sindelar_cz.pdf', '_blank');
            break;
          case 'en':
            console.log('en');
            window.open('pdf/pavel_sindelar_en.pdf', '_blank');
            break;
          default:
            break;
        }
      });
  }
  public openEmailDialog(): void {
    this.dialog.open(EmailDialogComponent, {
      data: { email: this.aboutMe.email },
    });
  }

  public technologies: Array<Technologies> = [
    { name: 'Angular', icon: 'angular_new' },
    { name: 'Ionic', icon: 'ionic' },
    { name: 'Typescript', icon: 'typescript' },
    { name: 'Git', icon: 'git' },
    { name: 'Github', icon: 'github' },
    { name: 'Docker', icon: 'docker' },
  ];
  public aboutMe: AboutMe = {
    name: 'Pavel Šindelář',
    info: {
      title: '',
      description: '',
    },
    email: 'mr.psovod@gmail.com',
    github: 'https://github.com/Psovod',
    linkedin: 'https://www.linkedin.com/in/pavlikson',
    education: [],
    jobs: [],
  };
}
