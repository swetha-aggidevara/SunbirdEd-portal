import { async, ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CreateCollectionComponent } from './create-collection.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SuiModule } from 'ng2-semantic-ui';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Ng2IziToastModule } from 'ng2-izitoast';
import { SuiModalService, TemplateModalConfig, ModalTemplate } from 'ng2-semantic-ui';
import { ResourceService, ConfigService, ToasterService, ServerResponse } from '@sunbird/shared';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorService } from '@sunbird/workspace';
import { ContentService, UserService, LearnerService } from '@sunbird/core';
import { mockRes } from './create-collection.component.spec.data';
import { componentFactoryName } from '@angular/compiler';

describe('CreateCollectionComponent', () => {
  let component: CreateCollectionComponent;
  let fixture: ComponentFixture<CreateCollectionComponent>;


  class RouterStub {
    navigate = jasmine.createSpy('navigate');
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateCollectionComponent],
      imports: [HttpClientTestingModule, Ng2IziToastModule,
        SuiModule, ReactiveFormsModule],
      providers: [EditorService, UserService, ContentService,
        ResourceService, ToasterService, ConfigService, LearnerService,
        { provide: Router, useClass: RouterStub }

      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should call createCollection method', inject([EditorService, UserService, Router], (editorService, userService, router) => {
    userService._userData$.next({ err: null, userProfile: mockRes.userMockData });

    spyOn(editorService, 'create').and.returnValue(Observable.of(mockRes.createCollectionData));
    component.createCollection();
    expect(router.navigate).toHaveBeenCalledWith(
      ['/workspace/content/edit/collection', 'do_2124708548063559681134', 'CollectionEditor', '', 'framework']);
  }));

  it('should call createCollection method', inject([EditorService, UserService, Router, ToasterService, ResourceService],
    (editorService, userService, router, toasterService, resourceService) => {

      resourceService.messages = mockRes.resourceBundle.messages;

      userService._userData$.next({ err: null, userProfile: mockRes.userMockData });

      spyOn(editorService, 'create').and.returnValue(Observable.throw(mockRes.errResponseData));
      spyOn(toasterService, 'error').and.callThrough();
      component.createCollection();
      expect(toasterService.error).toHaveBeenCalledWith(resourceService.messages.emsg.m0005);

    }));


  it('test routing', inject([Router], (router) => {
    component.goToCreate();
    expect(router.navigate).toHaveBeenCalledWith(['/workspace/content/create']);
  }));

});
