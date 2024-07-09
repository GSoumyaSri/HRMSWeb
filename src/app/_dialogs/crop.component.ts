import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-cropper',
  template: `
    <div class="image-cropper-wrapper" *ngIf="showCropper">
      <div class="image-cropper-content" >

        <image-cropper
          [imageChangedEvent]="imageChangedEvent"
          [maintainAspectRatio]="false"
          [aspectRatio]="1 / 1.5"
          format="png"
          (imageCropped)="imageCropped($event)"
          (loadImageFailed)="loadImageFailed()"
        ></image-cropper>

        <button p-button class="p-element p-ripple p-button-primary p-button p-component form-btn" (click)="cropImage()">Crop</button>
      </div>
    </div>
  `,
  styles: [`
  .image-cropper-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .4);
    z-index: 9999;
  }   
  .image-cropper-wrapper .image-cropper-content {
    width: 330px !important;
    position: absolute !important;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #FFFFFF;
    box-shadow: 0 3px 15px 0 rgba(0, 0, 0, 0.4);
    border-radius: 10px;
    padding: 25px 25px 100px !important;
  }
  .image-cropper-wrapper .form-btn {
    position: absolute;
    left: 50%;
    bottom: 0px;
    text-align:center;
    transform: translateX(-50%);
  }
`]
})
export class ImageCropComponent {
  private _imageChangedEvent: any = '';
  @Input() set imageChangedEvent(e: any) {
    this._imageChangedEvent = e;
    if (e) {
      this.showCropper = true;
      this.croppedImageName = e.target.files[0].name;
    } else {
      this.showCropper = false;
    }
  } get imageChangedEvent(): any {
    return this._imageChangedEvent;
  }

  @Output() done: EventEmitter<any> = new EventEmitter();

  showCropper = false;
  private croppedImage: any = '';
  private croppedImageName = 'cropped image';



  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.file;
  }
  loadImageFailed(): void {
    this.done.emit(null);
    this.showCropper = false;
  }
  cropImage(): void {
    const file: File = new File([this.croppedImage], this.croppedImageName, { type: 'image/png' });
    this.done.emit(file);
    this.showCropper = false;
  }
}
