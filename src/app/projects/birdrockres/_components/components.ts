import { _Component } from '../../../shared/services/project.service';
export const BIRDROCKRES_DESKTOP_COMPONENTS: Array<_Component> = [
  {
    name: 'Property Feed',
    _onlyView: 'both',
    summary: `
    <ul class="space-y-4">
      <li>
        <strong class="text-lg text-gray-800">Property Feed:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>A searchable list of properties with their addresses.</li>
          <li>Pagination is included for navigation.</li>
          <li>Each property has options to edit or delete.</li>
          <li>An "Add Property" button is visible to create new entries.</li>
        </ul>
      </li>
      <li>
        <strong class="text-lg text-gray-800">Property Information Dialog:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>A form for editing property details.</li>
          <li>
            Fields include property owner, manager, landlord email, property name, address, city, state, postal code,
            built date, acquisition date, assessment frequency, amortization duration, and notes.
          </li>
          <li>A "Save" button confirms changes, and a "Close" button cancels.</li>
        </ul>
      </li>
    </ul>
  `,
    path: {
      desktop: 'img/webm/00_property-feed.webm',
      mobile: 'img/webm/mobile/00_property-feed-mobile.webm',
    },
  },
  {
    name: 'Property Dashboard',
    _onlyView: 'both',
    summary: ` <ul class="space-y-4">
      <li>
        <strong class="text-xl text-gray-800">Property Information:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays details such as property name, owner, built date, and management duration.</li>
          <li>Edit button allows updating the property information.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">The Most Recently Submitted Assessment:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays the next assessment date, type, and submission details.</li>
          <li>View button allows reviewing the most recent assessment data.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">The Most Recently Submitted Work Order:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays creation and submission details of the work order.</li>
          <li>View button allows reviewing the most recent work order data.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Charts and Graphs:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Shows document status (e.g., assessments and work orders).</li>
          <li>Visualizes data using pie and bar charts for document labels, assessment types, appliances, and items.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Appliances and Additional Items:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays a detailed table for appliances and additional items.</li>
          <li>Includes columns for name, age, life expectancy, replacement cost, reserve requirements, and estimated monthly reserve.</li>
          <li>Edit and delete options are available for each entry.</li>
        </ul>
      </li>
    </ul>`,
    path: {
      desktop: 'img/webm/01_property-dashboard.webm',
      mobile: 'img/webm/mobile/01_property-dashboard-mobile.webm',
    },
  },
  {
    name: 'Document Feed',
    _onlyView: 'both',
    summary: ` <ul class="space-y-4">
      <li>
        <strong class="text-xl text-gray-800">Document Feed:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays a searchable list of documents with labels, statuses, and timestamps.</li>
          <li>Each document has options for adding labels, moving to another property, or deleting.</li>
          <li>Includes a "Load More" button to fetch additional documents.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Label Selection:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Allows creating and selecting labels for documents.</li>
          <li>Displays labels with color-coded options and edit/delete functionality.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Filter Documents:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Provides filtering options based on date range, labels, and assessment types.</li>
          <li>Includes an "Apply Filters" button to update the document list.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Create Document:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Enables creating new documents with fields for title, type, property, and template.</li>
          <li>Includes options for sharing via a link and adding notes.</li>
        </ul>
      </li>
    </ul>`,
    path: {
      desktop: 'img/webm/02_document-feed.webm',
      mobile: 'img/webm/mobile/02_document-feed-mobile.webm',
    },
  },
  {
    name: 'Document View',
    _onlyView: 'both',
    summary: `  <ul class="space-y-4">
      <li>
        <strong class="text-xl text-gray-800">Room Overview:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays room details, including the creation time, last edited time, and associated user email.</li>
          <li>Navigation sidebar allows switching between rooms.</li>
          <li>Update, Gallery, Filter, Assign, and Share options available as quick actions.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Room Sections:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays various sections, such as Landscaping, Building Exterior, and Electrical Items.</li>
          <li>Each section can display statuses like "Good," "Bad," or "Repair" with corresponding icons.</li>
          <li>Details and images are accessible for each section.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Filter Functionality:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Provides filtering options for sections based on their status (e.g., Good, Bad, Repair).</li>
          <li>Allows toggling filters to show sections matching specific criteria.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">User Assignment:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Users can be assigned to specific sections or rooms via a selection interface.</li>
          <li>Supports multiple user assignments with clear display of selected users.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Share Functionality:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Provides options to either share the document or create a copy for sharing.</li>
          <li>Sharing options include specifying the recipient's email, name, status, and time range.</li>
          <li>A modal interface ensures clear selection of share preferences.</li>
          <li>"Share" sends an email with the document link, while "Create a Copy" sends a link to the copied document.</li>
        </ul>
      </li>
    </ul>`,
    path: {
      desktop: 'img/webm/03_document-view.webm',
      mobile: 'img/webm/mobile/03_document-view-mobile.webm',
    },
  },
  {
    name: 'Photo Feed',
    _onlyView: 'both',
    summary: `<ul class="space-y-4">
      <li>
        <strong class="text-xl text-gray-800">Photo Display:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays photos grouped by date, with labels for associated areas and categories.</li>
          <li>Provides hover options for individual photo actions such as selection or more details.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Selection and Actions:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Allows multiple photo selections using checkboxes.</li>
          <li>Actions include "Report," "Share," "Convert," "Download," and "Delete."</li>
          <li>"Report" generates a link for selected photos, while "Convert" creates a work order with sharing options.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Filters:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Provides filter options for photos by start date, end date, area name, item name, category, and tags.</li>
          <li>Ensures dynamic filtering with instant updates to the displayed photos.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Share Functionality:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Enables sharing selected photos via email, specifying the recipient's details, status, and time range.</li>
          <li>Includes options to share the original photos or create and share copies.</li>
        </ul>
      </li>
    </ul>`,
    path: {
      desktop: 'img/webm/04_photo-feed.webm',
      mobile: 'img/webm/mobile/04_photo-feed-mobile.webm',
    },
  },
  {
    name: 'Report Feed',
    _onlyView: 'both',
    summary: ` <ul class="space-y-4">
      <li>
        <strong class="text-xl text-gray-800">Report Feed:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays a list of reports with details like property name, report title, date, and type (e.g., work-order, assessment).</li>
          <li>Includes pagination for easy navigation through multiple reports.</li>
          <li>Each report card features a dropdown menu with actions such as "Lock," "View," "Label," "Info," and "Delete."</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Filter Reports:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Allows filtering by criteria such as start date, end date, labels, and properties.</li>
          <li>Dynamic filtering instantly updates the displayed report list based on user input.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Report Labels:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Provides label management, including assigning, creating, editing, and deleting labels for reports.</li>
          <li>Accessible through a modal interface with color-coded label options.</li>
        </ul>
      </li>
    </ul>`,
    path: {
      desktop: 'img/webm/05_report-feed.webm',
      mobile: 'img/webm/mobile/05_report-feed-mobile.webm',
    },
  },
  {
    name: 'Report View',
    _onlyView: 'both',
    summary: `<ul class="space-y-4">
      <li>
        <strong class="text-xl text-gray-800">General Overview:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays grouped photos by area categories such as "Landlord-Landscaping" or "N/A (No Category)".</li>
          <li>Provides hover options for selecting, editing, or deleting photos in batches or individually.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Photo Details:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Shows metadata for photos including timestamps, area names, and associated tags.</li>
          <li>Supports drag-and-drop actions for rearranging photos within groups.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Actions:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Allows adding, assigning, or removing photos with buttons for "Add Photos," "Assign To," and "Create PDF."</li>
          <li>Provides sharing and report-generation functionalities with customizable recipient details.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Filters:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Dynamic filter options for viewing photos by date, category, area name, and tags.</li>
          <li>Ensures real-time updates based on applied filters for refined photo management.</li>
        </ul>
      </li>
    </ul>`,
    path: {
      desktop: 'img/webm/06_report-view.webm',
      mobile: 'img/webm/mobile/06_report-view-mobile.webm',
    },
  },
  {
    name: 'Report PDF ',
    _onlyView: 'desktop',
    summary: `<ul class="space-y-4">
      <li>
        <strong class="text-xl text-gray-800">Feature Overview:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Generates a detailed PDF report for selected properties and photos.</li>
          <li>Offers customization options for title, logo, and grouping of content.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Photo Grouping:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Photos are grouped by date, area, or category (e.g., "Landlord-Landscaping").</li>
          <li>Includes tags and status information for easy identification.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Content Details:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays timestamps, area names, and additional tags for photo groups.</li>
          <li>Provides detailed links to individual photos for reference.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">User Controls:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Allows adding a logo, editing the report title, and sharing the PDF via email.</li>
          <li>Supports saving the generated PDF for offline access.</li>
        </ul>
      </li>
    </ul>`,
    path: {
      desktop: 'img/webm/07_report-pdf.webm',
      mobile: null, //doesnt exists
    },
  },
  {
    name: 'Template Feed',
    _onlyView: 'both',
    summary: `  <ul class="space-y-4">
      <li>
        <strong class="text-xl text-gray-800">Template Management:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays a list of existing templates categorized by type and purpose.</li>
          <li>Includes quick search functionality to filter templates by name.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Actions:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Allows users to delete templates to maintain relevance.</li>
          <li>Supports cloning existing templates for rapid customization.</li>
          <li>Provides detailed information about each template with the "Info" option.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">User Controls:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Enables users to create new templates with the "+" button.</li>
          <li>Refreshes the template feed dynamically with the reload button.</li>
        </ul>
      </li>
    </ul>`,
    path: {
      desktop: 'img/webm/08_template-feed.webm',
      mobile: 'img/webm/mobile/08_template-feed-mobile.webm',
    },
  },
  {
    name: 'Template View',
    _onlyView: 'both',
    summary: `<ul class="space-y-4">
      <li>
        <strong class="text-xl text-gray-800">Room and Area Configuration:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Allows adding, editing, and deleting rooms or areas for the assessment.</li>
          <li>Each area has customizable sections like "Building Exterior," "Electrical Items," and more.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Item Management:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Supports adding detailed items for inspection under each area.</li>
          <li>Options to view, delete, or update individual items.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Template Configuration:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Includes category tags, image tags, and status lists for easier categorization and identification.</li>
          <li>Status options such as "Good," "Bad," and "Repair" can be added or removed dynamically.</li>
          <li>Custom tags for categories or images can be created on the fly.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Save and Update:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Enables saving the assessment configurations with a single click.</li>
          <li>Configurations can be updated or modified at any time using the "Config" option.</li>
        </ul>
      </li>
    </ul>`,
    path: {
      desktop: 'img/webm/09_template-view.webm',
      mobile: 'img/webm/mobile/09_template-view-mobile.webm',
    },
  },
  {
    name: 'User Management',
    _onlyView: 'both',
    summary: ` <ul class="space-y-4">
      <li>
        <strong class="text-xl text-gray-800">User Overview:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays a list of all users with their roles, contact information, and latest activity details.</li>
          <li>Icons and initials are used to represent users visually.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">User Actions:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Options for each user include editing details, deactivating accounts, and deleting accounts.</li>
          <li>Role assignment functionality allows selecting predefined roles or creating new ones.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Role Management:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Roles are customizable with specific permissions such as viewing, editing, or deleting properties, reports, and accounts.</li>
          <li>Existing roles can be edited, and new roles can be created with tailored permissions.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">User Creation:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>New users can be created with mandatory details like name, email, and role.</li>
          <li>Ensures validation checks for required fields during user creation.</li>
        </ul>
      </li>
    </ul>`,
    path: {
      desktop: 'img/webm/10_user-management.webm',
      mobile: 'img/webm/mobile/10_user-management-mobile.webm',
    },
  },
  {
    name: 'Photo Gallery',
    _onlyView: 'both',
    summary: ` <ul class="space-y-4">
      <li>
        <strong class="text-xl text-gray-800">Photo Preview:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Displays selected photo in a full preview mode with navigation options for previous and next photos.</li>
          <li>Includes drawing tools for marking or highlighting sections of the photo.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Tagging and Categorization:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Allows adding image tags and categories to the photo.</li>
          <li>Supports dynamic cost allocation between landlord and tenant.</li>
        </ul>
      </li>
      <li>
        <strong class="text-xl text-gray-800">Annotation Tools:</strong>
        <ul class="list-[square] pl-6 text-gray-700">
          <li>Provides freehand and straight-line drawing with adjustable stroke width and color options.</li>
          <li>Allows saving annotations directly on the photo.</li>
        </ul>
      </li>
    </ul>`,
    path: {
      desktop: 'img/webm/11_photo-gallery.webm',
      mobile: 'img/webm/mobile/11_photo-gallery-mobile.webm',
    },
  },
];
export const BIRDROCKRES_MOBILE_COMPONENTS: Array<_Component> = [
  {
    name: 'Shared Documents',
    _onlyView: 'mobile',
    summary: ``,
    path: {
      desktop: null,
      mobile: 'img/webm/ionic/00_shared-document-feed-ionic.webm',
    },
  },
  {
    name: 'Property Feed',
    _onlyView: 'mobile',
    summary: ``,
    path: {
      desktop: null,
      mobile: 'img/webm/ionic/01_property-feed-ionic.webm',
    },
  },
  {
    name: 'Document Feed',
    _onlyView: 'mobile',
    summary: ``,
    path: {
      desktop: null,
      mobile: 'img/webm/ionic/02_document-feed-ionic.webm',
    },
  },
  {
    name: 'Document View',
    _onlyView: 'mobile',
    summary: ``,
    path: {
      desktop: null,
      mobile: 'img/webm/ionic/03_document-view-ionic.webm',
    },
  },
  {
    name: 'Photo Feed',
    _onlyView: 'mobile',
    summary: ``,
    path: {
      desktop: null,
      mobile: 'img/webm/ionic/04_photo-feed-ionic.webm',
    },
  },
  {
    name: 'Report Feed',
    _onlyView: 'mobile',
    summary: ``,
    path: {
      desktop: null,
      mobile: 'img/webm/ionic/05_report-feed-ionic.webm',
    },
  },
  {
    name: 'Report View',
    _onlyView: 'mobile',
    summary: ``,
    path: {
      desktop: null,
      mobile: 'img/webm/ionic/06_report-view-ionic.webm',
    },
  },
  {
    name: 'Assigned Work',
    _onlyView: 'mobile',
    summary: ``,
    path: {
      desktop: null,
      mobile: 'img/webm/ionic/07_assigned-work-ionic.webm',
    },
  },
  {
    name: 'Photo Gallery',
    _onlyView: 'mobile',
    summary: ``,
    path: {
      desktop: null,
      mobile: 'img/webm/ionic/08_photo-gallery-ionic.webm',
    },
  },
];

export const NBAZAR_COMPONENTS: Array<_Component> = [];
export const BAGRAK_COMPONENTS: Array<_Component> = [];
