// import { CodeSnippet } from '../../../shared/services/project.service';

// export const PROPERTY_FEED_HTML: CodeSnippet = {
//   language: 'HTML',
//   title: 'properties.component.html',
//   text: `<div *ngIf="propertyList$ | async | filter : searchText as propertyList">
//   <div class="space-y-2">
//       <div
//         (click)="loadProperty(property.archived, property.property_id)"
//         *ngFor="let property of propertyList | paginate : config"
//         class="flex items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-200 cursor-pointer">
//         <div class="flex items-center space-x-4">
//           <div class="flex flex-col">
//             <span class="text-sm font-medium text-gray-900">{{ property.data.propertyName }}</span>
//             <span class="text-xs text-gray-500">
//             {{ property.data.propertyStreet }} {{ property.data.propertyState }},
//               {{ property.data.propertyPostal }}</span>
//           </div>
//         </div>
//         <div class="flex items-center space-x-2">
//           <button
//             *ngIf="property.archived"
//             (click)="deleteProperty(property); $event.stopPropagation()"
//             class="p-1 text-red-600 rounded-md hover:bg-red-200">
//             <fa-icon [icon]="faIcons.trash"></fa-icon>
//           </button>
//           <button
//             *ngIf="!property.archived"
//             (click)="openProperty(property); $event.stopPropagation()"
//             class="p-1 rounded-md text-blue-600 hover:bg-blue-200">
//             <fa-icon [icon]="faIcons.edit"></fa-icon>
//           </button>
//           <button
//             (click)="archiveProperty(property); $event.stopPropagation()"
//             class="p-1 rounded-md"
//             ngClass="{{ property.archived ? 'text-green-400 hover:bg-green-200' : 'text-orange-800 hover:bg-orange-600' }}">
//             <fa-icon [icon]="property.archived ? faIcons.restore : faIcons.archive"></fa-icon>
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>`,
// };
// export const PROPERTY_FEED_TS: CodeSnippet = {
//   language: 'typescript',
//   title: 'properties.component.ts',
//   text: `import { Component, OnInit } from "@angular/core";
// import { Select, Store } from "@ngxs/store";
// import { PropertyListStateActions } from "./state/property-list.actions";
// import { AuthState } from "../login/state/auth.state";
// import { Observable, lastValueFrom, take } from "rxjs";
// import { PropertyListState } from "./state/property-list.state";
// import { PropertyListData } from "src/app/types";
// import {
//   faAdd,
//   faAngleLeft,
//   faAngleRight,
//   faArchive,
//   faEdit,
//   faSearch,
//   faTrash,
//   faTrashRestore,
// } from "@fortawesome/free-solid-svg-icons";
// import { CreatePropertyComponent } from "./components/modal/create-property.component";
// import { MatDialog } from "@angular/material/dialog";
// import { ConfirmDeleteModalComponent } from "src/app/shared/components/confirm-delete/confirm-delete.component";
// @Component({
//   selector: "app-properties",
//   templateUrl: "./properties.component.html",
//   styleUrls: ["./properties.component.scss"],
// })
// export class PropertiesComponent implements OnInit {
//   @Select(PropertyListState.list) propertyList$: Observable<Array<PropertyListData>>;
//   constructor(private store: Store, private dialog: MatDialog) {
//     this.store.dispatch(new PropertyListStateActions.Load());
//   }
//   public faIcons = {
//     prev: faAngleLeft,
//     add: faAdd,
//     next: faAngleRight,
//     search: faSearch,
//     trash: faTrash,
//     edit: faEdit,
//     archive: faArchive,
//     restore: faTrashRestore,
//   };
//   config = {
//     id: "custom",
//     itemsPerPage: 10,
//     currentPage: 1,
//     maxSize: 4,
//   };
//   buttonText: boolean = true;
//   public searchText: string = "";
//   userType$: String = this.store.selectSnapshot(AuthState.type);
//   assignedProperties$ = this.store.selectSnapshot(AuthState.assignedProperties);

//   ngOnInit(): void {}
//   showArchived() {
//     if (this.buttonText) {
//       this.store.dispatch(new PropertyListStateActions.Load(true));
//       this.buttonText = false;
//     } else {
//       this.store.dispatch(new PropertyListStateActions.Load());
//       this.buttonText = true;
//     }
//   }

//   public openProperty(property: PropertyListData) {
//     this.dialog.open(CreatePropertyComponent, {
//       width: "80%",
//       maxWidth: "800px",
//       data: property,
//     });
//   }
//   async archiveProperty(property: PropertyListData) {
//     await lastValueFrom(
//       this.store.dispatch(new PropertyListStateActions.Archive(property.property_id, property.archived ? false : true))
//     );
//   }
//   async deleteProperty(property: PropertyListData) {
//     this.dialog
//       .open(ConfirmDeleteModalComponent, {
//         panelClass: "warning-dialog",
//         data: {
//           confirmationPattern: property.data.propertyName ?? property.property_id,
//           title: "Property",
//         },
//       })
//       .afterClosed()
//       .pipe(take(1))
//       .subscribe(async res => {
//         if (res) await lastValueFrom(this.store.dispatch(new PropertyListStateActions.Delete(property.property_id)));
//       });
//   }
//   onPageChange(event) {
//     this.config.currentPage = event;
//   }
//   public loadProperty(archived: number, id: number) {
//     archived ? false : this.store.dispatch(new PropertyListStateActions.Set(id, true));
//   }
// }
// `,
// };
// export const PROPERTY_FEED_MODULE: CodeSnippet = {
//   language: 'typescript',
//   title: 'properties.module.ts',
//   text: `import { NgModule } from "@angular/core";
// import { RouterModule } from "@angular/router";
// import { CommonModule } from "@angular/common";
// import { PropertiesComponent } from "./properties.component";
// import { FormsModule, ReactiveFormsModule } from "@angular/forms";

// import { NgxPaginationModule } from "ngx-pagination";
// import { Ng2SearchPipeModule } from "ng2-search-filter";
// import { HttpClientModule } from "@angular/common/http";
// import { CreatePropertyComponent } from "./components/modal/create-property.component";
// import { NgxsRouterPluginModule } from "@ngxs/router-plugin";
// import { PermissionWrapperModule } from "src/app/shared/components/permission-wrapper/permission-wrapper.module";
// import { MaterialModule } from "src/app/material/material.module";
// import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
// @NgModule({
//   declarations: [PropertiesComponent, CreatePropertyComponent],
//   imports: [
//     CommonModule,
//     NgxPaginationModule,
//     Ng2SearchPipeModule,
//     FormsModule,
//     ReactiveFormsModule,
//     HttpClientModule,
//     RouterModule,
//     MaterialModule,
//     FontAwesomeModule,
//     NgxsRouterPluginModule.forRoot(),
//     PermissionWrapperModule,
//   ],
// })
// export class PropertiesModule {}`,
// };
