import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TranslateDirective } from '@ngx-translate/core';
export interface Project {
  id: string;
  name: string;
  technologies: Array<Technologies>;
  description: string;
  summary: string;
  private: boolean;
  github_url?: string;
  _i18n: string;
}
export interface Technologies {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-projects',
  imports: [MaterialModule, RouterModule, CommonModule, TranslateDirective],
  templateUrl: './projects.component.html',
  animations: [
    trigger('textRollout', [
      state(
        'collapsed',
        style({
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': 1,
          height: '20px', // Adjust this height to match the line-clamp height
          transform: 'translateY(-10px)',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
          transform: 'translateY(0)',
        })
      ),
      transition('collapsed <=> expanded', [animate('0.3s ease')]),
    ]),
  ],
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  public projects: Array<Project> = [
    {
      id: '1',
      name: 'Birdrockres',
      _i18n: 'app.birdrockres',
      technologies: [
        { name: 'Angular 14', icon: 'angular' },
        { name: 'Typescript', icon: 'typescript' },
        { name: 'HTML', icon: 'html' },
        { name: 'Tailwind', icon: 'tailwind' },
        { name: 'Material', icon: 'material' },
        { name: 'CSS', icon: 'css' },
      ],
      private: true,
      summary: 'Property management application.',
      description: `Birdrockres is a web-based application designed for property management, specifically tailored to streamline the management of rental properties. Built using the Angular framework, the application offers a comprehensive solution for property owners and tenants. It facilitates the upload and management of property-related documents, tracks inspections, and organizes photographic documentation with high resolution.

Key features include advanced functionality to categorize and label data for easier navigation, a user-friendly interface, and seamless document sharing without requiring the recipient to install additional software—accessible directly through a web browser. Developed as part of a personal portfolio project, this application showcases expertise in Angular development, demonstrating the ability to build scalable, functional, and user-focused web applications.`,
    },
    {
      id: '2',
      name: 'Birdrockres Mobile App',
      _i18n: 'app.birdrockres_mobile',
      technologies: [
        { name: 'Ionic', icon: 'ionic' },
        { name: 'Angular 14', icon: 'angular' },
        { name: 'Typescript', icon: 'typescript' },
        { name: 'HTML', icon: 'html' },
        { name: 'CSS', icon: 'css' },
        { name: 'PWA', icon: 'pwa' },
        { name: 'Swift', icon: 'swift' },
        { name: 'Kotlin', icon: 'kotlin' },
      ],
      private: true,
      summary: 'Mobile application for property management.',
      description: `The Birdrockres Mobile App is a progressive web application (PWA) designed to complement the Birdrockres web platform, offering a mobile-friendly solution for property management on the go. Developed using the Ionic framework, the app provides a seamless user experience across various devices, enabling property owners and tenants to access key features and functionalities from their smartphones or tablets.
      `,
    },
    {
      id: '3',
      name: 'NBazar',
      private: false,
      github_url: 'https://github.com/Psovod/NBazar',
      _i18n: 'app.nbazar',
      technologies: [
        { name: 'Angular 17', icon: 'angular_new' },
        { name: 'Typescript', icon: 'typescript' },
        { name: 'HTML', icon: 'html' },
        { name: 'Tailwind', icon: 'tailwind' },
        { name: 'CSS', icon: 'css' },
      ],
      summary: 'Property marketplace management application',
      description: `NBazar is a web-based application designed for marketplace management, providing a streamlined platform for buying, selling, and managing items. Built using the Angular framework, it showcases robust functionality and a user-centric design, catering to individuals and small businesses looking for an efficient solution for online trading.

Key features include a responsive interface, advanced item categorization, seamless image uploads, and search capabilities. The application emphasizes simplicity and accessibility, ensuring a smooth user experience. Developed as part of a personal portfolio project, NBazar highlights expertise in Angular development, demonstrating proficiency in creating scalable and user-focused web solutions.`,
    },
    {
      id: '4',
      name: 'Bagrák',
      private: true,
      _i18n: 'app.bagrak',
      technologies: [
        { name: 'Javascript', icon: 'javascript' },
        { name: 'HTML', icon: 'html' },
        { name: 'Tailwind', icon: 'tailwind' },
        { name: 'CSS', icon: 'css' },
      ],
      summary: 'Agricultural job board application',
      description: `zemniprace-bagrak is a web-based application designed to serve as a job board for agricultural workers and employers. Developed using the Angular framework, the application offers a user-friendly interface for posting and applying for agricultural job opportunities, facilitating communication between job seekers and employers in the agricultural sector.
      `,
    },
  ];
}
