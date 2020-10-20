import { Injectable } from '@angular/core';
import { ConfigService } from '@sunbird/shared';
import { PublicDataService } from '@sunbird/core';
import { HttpClient } from '@angular/common/http';
import { ContentService } from './../../../../modules/core/services/content/content.service';


@Injectable({
  providedIn: 'root'
})
export class UploadCertificateService {

  constructor(
    public publicDataService: PublicDataService,
    public http: HttpClient,
    public configService: ConfigService,
    public contentService: ContentService
  ) { }

  /**
   * To get the asset images (State logos and Signs)
   * to get the particular asset we need to pass asset naem as query
   */
  getAssetData(query?) {
    const body = {
      "request": {
        "filters": {
          "mediaType": ["image"],
          "contentType": ["Asset"],
          "compatibilityLevel": { "min": 1, "max": 2 },
          "status": ["Live"],
          "channel": "b00bc992ef25f1a9a8d63291e20efc8d"
        },
        "limit": 50,
        "offset": 0
      }
    }
    if (query) {
      body['request']['query'] = query;
    }
    const option = {
      url: this.configService.urlConFig.URLS.CONTENT.SEARCH,
      data: body
    };
    return this.publicDataService.post(option);
  }

  /**
  * To create new asset images (State logos and Signs) and it create space
  */
  createAsset(reqObj) {
    const body = {
      "request":
      {
        "content": {
          "name": reqObj.assetCaption,
          "creator": reqObj.creator,
          "createdBy": reqObj.creatorId,
          "code": "org.ekstep0.9002440445885993",
          "mimeType": "image/png",
          "mediaType": "image",
          "contentType": "Asset",
          "osId": "org.ekstep.quiz.app",
          "language": ["English"]
        }
      }
    };

    const option = {
      url: this.configService.urlConFig.URLS.CONTENT.CREATE,
      data: body
    };
    return this.publicDataService.post(option);
  }

  /**
   * To upload new asset images (State logos and Signs) into the particular space
   */
  storeAsset(file, identifier) {
    const formData = new FormData();
    formData.append('file', file);
    const option = {
      url: `${this.configService.urlConFig.URLS.CONTENT.UPLOAD}/${identifier}`,
      data: formData
    };
    return this.publicDataService.post(option);
  }

  getSvg(path): Promise<any> {
    return this.http.get('/' + path, { responseType: 'text' }).toPromise();
  }

  createCertTemplate(data) {
    const option = {
      url: this.configService.urlConFig.URLS.CERTIFICATE.CREATE_CERT_TEMPLATE,
      data: data
    };
    return this.contentService.post(option);
  }

  uploadTemplate(svgFile, identifier) {
    const formData = new FormData();
    formData.append('file', svgFile);
    const option = {
      url: `${this.configService.urlConFig.URLS.CERTIFICATE.UPLOAD_CERT_TEMPLATE}/${identifier}`,
      data: formData
    };
    return this.contentService.post(option);
  }
}