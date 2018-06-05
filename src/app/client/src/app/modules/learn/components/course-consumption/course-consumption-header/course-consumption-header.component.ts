import { Component, OnInit, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CourseConsumptionService, CourseProgressService } from './../../../services';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import { CollectionHierarchyAPI, ContentService, CoursesService, PermissionService, CopyContentService } from '@sunbird/core';
import { ResourceService, ToasterService, ContentData, ContentUtilsServiceService, ITelemetryShare } from '@sunbird/shared';
import { ILogEventInput } from '@sunbird/telemetry';
@Component({
  selector: 'app-course-consumption-header',
  templateUrl: './course-consumption-header.component.html',
  styleUrls: ['./course-consumption-header.component.css']
})
export class CourseConsumptionHeaderComponent implements OnInit, AfterViewInit {
  sharelinkModal: boolean;
  /**
   * contains link that can be shared
   */
  flaggedCourse = false;
  /**
	 * telemetryShareData
	*/
  telemetryShareData: Array<ITelemetryShare>;
  shareLink: string;
  /**
   * to show loader while copying content
   */
  showCopyLoader = false;
  onPageLoadResume = true;
  @Input() courseHierarchy: any;
  @Input() enrolledCourse: boolean;
  batchId: any;
  dashboardPermission = ['COURSE_MENTOR'];
  courseId: string;
  lastPlayedContentId: string;
  showResumeCourse = true;
  progress: number;
  courseStatus: string;
  constructor(private activatedRoute: ActivatedRoute, private courseConsumptionService: CourseConsumptionService,
    public resourceService: ResourceService, private router: Router, public permissionService: PermissionService,
    public toasterService: ToasterService, public copyContentService: CopyContentService, private changeDetectorRef: ChangeDetectorRef,
    private courseProgressService: CourseProgressService, public contentUtilsServiceService: ContentUtilsServiceService) {

  }

  ngOnInit() {
    this.activatedRoute.firstChild.params.subscribe((param) => {
      this.courseId = param.courseId;
      this.batchId = param.batchId;
      this.courseStatus = param.courseStatus;
      this.progress = this.courseHierarchy.progress;
      if (this.courseHierarchy.status === 'Flagged') {
        this.flaggedCourse = true;
      }
      if (this.batchId) {
        this.enrolledCourse = true;
      }
    });
  }
  ngAfterViewInit() {
    this.courseProgressService.courseProgressData.subscribe((courseProgressData) => {
      this.enrolledCourse = true;
      this.progress = courseProgressData.progress ? Math.round(courseProgressData.progress) :
        this.progress;
      // this.changeDetectorRef.detectChanges();
      this.lastPlayedContentId = courseProgressData.lastPlayedContentId;
      if (this.onPageLoadResume && !this.flaggedCourse) {
        this.onPageLoadResume = false;
        this.showResumeCourse = false;
        this.resumeCourse();
      }
    });
  }

  showDashboard() {
    this.router.navigate(['learn/course', this.courseId, 'dashboard']);
  }

  resumeCourse() {
    const navigationExtras: NavigationExtras = {
      queryParams: { 'contentId': this.lastPlayedContentId },
      relativeTo: this.activatedRoute
    };
    this.router.navigate([this.courseId, 'batch', this.batchId], navigationExtras);
  }

  flagCourse() {
    this.router.navigate(['flag'], { relativeTo: this.activatedRoute.firstChild });
  }
  /**
   * This method calls the copy API service
   * @param {contentData} ContentData Content data which will be copied
   */
  copyContent(contentData: ContentData) {
    this.showCopyLoader = true;
    const logEvent: ILogEventInput = {
      context: { env: 'course' },
      edata: { type: 'api_call', level: 'INFO', message: '' }
    };
    this.copyContentService.copyContent(contentData, logEvent).subscribe(
      (response) => {
        this.toasterService.success(this.resourceService.messages.smsg.m0042);
        this.showCopyLoader = false;
      },
      (err) => {
        this.showCopyLoader = false;
        this.toasterService.error(this.resourceService.messages.emsg.m0008);
      });
  }
  onShareLink() {
    this.shareLink = this.contentUtilsServiceService.getPublicShareUrl(this.courseId, this.courseHierarchy.mimeType);
    this.setTelemetryShareData(this.courseHierarchy);
  }
   setTelemetryShareData(param) {
    this.telemetryShareData = [{
      id: param.identifier,
      type: param.contentType,
      ver: param.pkgVersion ? param.pkgVersion : 1
    }];
  }
}
