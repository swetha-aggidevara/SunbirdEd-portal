import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FrameworkService, ChannelService, OrgDetailsService, DeviceRegisterService } from '@sunbird/core';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ResourceService, ToasterService } from '@sunbird/shared';
import * as _ from 'lodash-es';
import { PopupControlService } from '../../../../service/popup-control.service';
import { Subject } from 'rxjs';
import { TenantService } from '@sunbird/core';
import { takeUntil, map } from 'rxjs/operators';
import { IDeviceProfile } from '../../interfaces';
import { ITenantData } from './../../../core/services/tenant/interfaces/tenant';
@Component({
  selector: 'app-onboarding-framework',
  templateUrl: './onboarding-framework.component.html',
  styleUrls: ['./onboarding-framework.component.scss']
})
export class OnboardingFrameworkComponent implements OnInit {
  channelId;
  tenantInfo: ITenantData;
  allBoards: Array<{}> = [];
  allMediums: Array<{}> = [];
  allGrades: Array<{}> = [];
  selectedBoard: any;
  selectedMedium: any;
  selectedGrade: any;

  enableSubmitBtn = false;
  allowedFields = ['board', 'medium', 'gradeLevel'];
  frameworkCategories: Array<{}> = [];

  private unsubscribe$ = new Subject<void>();
  @Output() close = new EventEmitter<{}>();

  constructor(private frameworkService: FrameworkService, private channelService: ChannelService,
    public tenantService: TenantService, public resourceService: ResourceService,
    public popupControlService: PopupControlService, private deviceRegisterService: DeviceRegisterService,
    private orgDetailsService: OrgDetailsService) { }

  ngOnInit() {
    this.tenantService.tenantData$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        if (_.get(data, 'tenantData')) {
          this.tenantInfo = data.tenantData;
          this.tenantInfo.titleName = data.tenantData.titleName || this.resourceService.instance;
        }
      });

    this.orgDetailsService.getCustodianOrgDetails()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.channelId = _.get(data, 'result.response.value');
        this.setBoard();
      });
  }


  setBoard() {
    this.channelService.getFrameWork(this.channelId).subscribe(data => {
      this.allBoards = _.get(data, 'result.channel.frameworks');
    });
  }

  handleBoardChange() {
    this.selectedMedium = [];
    this.selectedGrade = [];
    this.allMediums = [];
    this.allGrades = [];
    this.enableSubmitBtn = false;
    this.frameworkService.getFrameworkCategories(_.get(this.selectedBoard, 'identifier')).subscribe(response => {
      this.frameworkCategories = _.get(response, 'result.framework.categories');
      const board = _.find(this.frameworkCategories, { code: 'board' });
      this.allMediums = this.getAssociationData(board.terms, 'medium');
    });
  }

  handleMediumChange() {
    this.allGrades = [];
    this.selectedGrade = [];
    this.enableSubmitBtn = false;
    this.allGrades = this.getAssociationData(this.selectedMedium, 'gradeLevel');
  }

  handleGradeChange() {
    this.enableSubmitBtn = !_.isEmpty(this.selectedGrade);
  }

  getAssociationData(selectedData, category) {

    let categoryData = [];
    _.map(this.frameworkCategories, element => {
      if (element.code === category) {
        categoryData = element.terms;
      }
    });

    _.map(selectedData, data => {
      _.find(data.associations, element => {
        if (element.category === category) {
          categoryData.concat(element);
        }
      });
    });

    return _.sortBy(_.uniqBy(_.compact(categoryData), 'identifier'), 'index');
  }

  onSubmit() {
      // const response = this.updateDeviceProfileData();
      const userData = `${{board: this.selectedBoard, medium: this.selectedMedium, gradeLevel: this.selectedGrade}}`;
      localStorage.setItem('user_framework', userData);
      this.popupControlService.changePopupStatus(true);
      this.close.emit(
        {board: this.selectedBoard, medium: this.selectedMedium, gradeLevel: this.selectedGrade}
      );
      // response.subscribe(dataa => {
      //   console.log('responseseses', dataa);
      // });
  }

  updateDeviceProfileData() {
    /* istanbul ignore else */
    return this.deviceRegisterService.updateDeviceProfile({
        board: _.omit(this.selectedBoard, 'associations'),
        medium: _.omit(this.selectedMedium, 'associations'),
        grade: _.omit( this.selectedGrade, 'associations')
    });
  }


}
