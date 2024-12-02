import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
export interface Project {
  id: string;
  name: string;
  technologies: Array<Technologies>;
  description: string;
}
export interface Technologies {
  name: string;
  icon: string;
}
@Component({
  selector: 'app-projects',
  imports: [MaterialModule, RouterModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  public projects: Array<Project> = [
    {
      id: '1',
      name: 'Birdrockres',
      technologies: [
        { name: 'Angular 14', icon: 'angular' },
        { name: 'Typescript', icon: 'typescript' },
        { name: 'HTML', icon: 'html' },
        { name: 'Tailwind', icon: 'tailwind' },
        { name: 'Material', icon: 'material' },
        { name: 'CSS', icon: 'css' },
      ],
      description: `is a web-based application designed for property management, specifically tailored to streamline the management of rental properties. Built using the Angular framework, the application offers a comprehensive solution for property owners and tenants. It facilitates the upload and management of property-related documents, tracks inspections, and organizes photographic documentation with high resolution.

Key features include advanced functionality to categorize and label data for easier navigation, a user-friendly interface, and seamless document sharing without requiring the recipient to install additional software—accessible directly through a web browser. Developed as part of a personal portfolio project, this application showcases expertise in Angular development, demonstrating the ability to build scalable, functional, and user-focused web applications.`,
    },
  ];
}
