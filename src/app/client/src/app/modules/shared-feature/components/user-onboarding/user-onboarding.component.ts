import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy, AfterViewInit, Pipe } from '@angular/core';
import { ResourceService, ToasterService } from '@sunbird/shared';
import * as _ from 'lodash-es';
import { PopupControlService } from '../../../../service/popup-control.service';
import { Subject, forkJoin, combineLatest, merge, of } from 'rxjs';
import { TenantService, DeviceRegisterService, UserService } from '@sunbird/core';
import { takeUntil, map, mergeAll, mergeMap, delay } from 'rxjs/operators';
import { IDeviceProfile } from '../../interfaces';
import { ITenantData } from './../../../core/services/tenant/interfaces/tenant';

export enum Stage {
  USER_SELECTION = 'user',
  LOCATION_SELECTION = 'location',
  FRAMEWORK_SELECTION = 'framework',
  SELECTED_ALL = 'all',
}

@Component({
  selector: 'app-user-onboarding',
  templateUrl: './user-onboarding.component.html',
  styleUrls: ['./user-onboarding.component.scss']
})
export class UserOnboardingComponent implements OnInit, OnDestroy {

  @Input() deviceProfile: IDeviceProfile;
  userProfile;
  @Input() isCustodianOrgUser: boolean;
  @Output() close = new EventEmitter<void>();
  @ViewChild('onboardingModal') onboardingModal;
  @Input() channelId: string;
  get Stage() { return Stage; }
  stage = Stage.SELECTED_ALL;
  tenantInfo: ITenantData;
  private unsubscribe$ = new Subject<void>();
  ipLocation;
  showModal = false;


  constructor(
    public resourceService: ResourceService,
    public toasterService: ToasterService,
    public popupControlService: PopupControlService,
    private deviceRegisterService: DeviceRegisterService,
    public tenantService: TenantService,
    private userService: UserService,
    private router: Router) {
  }

  ngOnInit() {
    this.tenantService.tenantData$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        if (_.get(data, 'tenantData')) {
          this.tenantInfo = data.tenantData;
          this.tenantInfo.titleName = data.tenantData.titleName || this.resourceService.instance;
        }
      });

    this.deviceRegisterService.getDeviceProfile().subscribe(deviceData => {
      this.deviceProfile = deviceData;
      this.ipLocation = _.pick(deviceData, 'ipLocation');
    });

    this.userService.userData$.subscribe(response => {
      this.userProfile = _.get(response, 'userProfile');
    });
    setTimeout(() => {
      this.getCurrentStage();
    }, 5000);
  }

  getCurrentStage() {
    this.stage = localStorage.getItem('userType') ? this.getStageValue() : Stage.USER_SELECTION;
    this.showModal = this.isLocationStatusRequired() ? false : this.stage !== Stage.SELECTED_ALL;
  }

  getStageValue() {
    if (this.userService.loggedIn) {
      return ((this.userProfile && _.isEmpty(_.get(this.userProfile, 'userLocations'))) ? Stage.LOCATION_SELECTION : (
        !localStorage.getItem('user_framework') ? Stage.FRAMEWORK_SELECTION : Stage.SELECTED_ALL));
    } else {
      return ((this.deviceProfile && _.isEmpty(_.get(this.deviceProfile, 'userDeclaredLocation'))) ? Stage.LOCATION_SELECTION : (
        !localStorage.getItem('user_framework') ? Stage.FRAMEWORK_SELECTION : Stage.SELECTED_ALL));
    }
  }

  isLocationStatusRequired() {
    const url = this.router.url;
    return !!(_.includes(url, 'signup') || _.includes(url, 'recover') || _.includes(url, 'sign-in'));
  }

  userTypeSubmit() {
    this.getCurrentStage();
  }

  locationSubmit(event) {
    this.showModal = !_.get(event, 'error');
    this.stage = Stage.FRAMEWORK_SELECTION;
  }

  frameworkSubmit() {
    this.stage = Stage.SELECTED_ALL;
    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
    this.popupControlService.changePopupStatus(true);
    this.close.emit();
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
