import { Component, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { TranslateDirective, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { Technologies } from '../shared/data/projects';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
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

@Component({
  selector: 'app-about',
  imports: [MaterialModule, RouterModule, TranslateDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  private dialog = inject(MatDialog);
  constructor() {
    const translate: TranslateService = inject(TranslateService);
    translate.stream('education').subscribe((res: Array<Education>) => {
      this.aboutMe.education = res;
    });
    translate.stream('about').subscribe((res: Info) => {
      this.aboutMe.info = res;
    });
    translate.stream('jobs').subscribe((res: Array<Job>) => {
      this.aboutMe.jobs = res;
    });
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
  public technologies: Array<Technologies> = [
    { name: 'Angular', icon: 'angular_new' },
    { name: 'Ionic', icon: 'ionic' },
    { name: 'Typescript', icon: 'typescript' },
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
