import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Departments } from './pages/departments/departments';
import { Notifications } from './pages/notifications/notifications';
import { Products } from './pages/products/products';
import { Settings } from './pages/settings/settings';
import { ActiveStudents } from './pages/students/active-students/active-students';
import { InactiveStudents } from './pages/students/inactive-students/inactive-students';
import { AllStudents } from './pages/students/all-students/all-students';
import { PrincipalsDesk } from './pages/about-us/principals-desk/principals-desk';
import { MissionVision } from './pages/about-us/mission-vision/mission-vision';
import { CodeOfConduct } from './pages/about-us/code-of-conduct/code-of-conduct';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { CollegeCommittees } from './pages/about-us/college-committees/college-committees';
import { AboutCollege } from './pages/about-us/about-college/about-college';
import { Academics } from './pages/academics/academics';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: Dashboard,
  },
  {
    path: 'about-us/principals-desk',
    component: PrincipalsDesk,
  },
  {
    path: 'about-us/mission-vision',
    component: MissionVision,
  },
  {
    path: 'about-us/code-conduct',
    component: CodeOfConduct,
  },
  {
    path: 'about-us/college-committees',
    component: CollegeCommittees,
  },
  {
    path: 'about-us/about-college',
    component: AboutCollege,
  },
  {
    path: 'academics',
    component: Academics,
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicy,
  },
  {
    path: 'departments',
    component: Departments,
  },
  {
    path: 'notifications',
    component: Notifications,
  },
  {
    path: 'products',
    component: Products,
  },
  {
    path: 'students/active-students',
    component: ActiveStudents,
  },
  {
    path: 'students/inactive-students',
    component: InactiveStudents,
  },
  {
    path: 'students/all-students',
    component: AllStudents,
  },
  {
    path: 'settings',
    component: Settings,
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
