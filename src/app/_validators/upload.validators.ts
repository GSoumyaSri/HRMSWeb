import { EventEmitter } from "@angular/core";
import { PhotoFileProperties } from "../_models/common";

export function ValidateFileThenUpload(file: any, emitProperties: EventEmitter<PhotoFileProperties>,
    fileSize: number = 10,
    dimensions: string = '595 x 842 pixels',
    resize: boolean = false,
    resizeTo: number = 300) {
    let fileName = file.name;
    let fileExtension = fileName.replace(/^.*\./, '');
    let fileReader: FileReader = new FileReader();
    var message: string = ''
    fileReader.onload = function (e) {
        if (/(^pdf$)|(^doc[x]*)/gi.test(fileExtension)) {
            message =
                `File can't be uploaded. May be uploaded file '${file.name}' size ${Math.round(file.size/1024/1024)} Mb
                is grater than allowed size ${fileSize} Mb`;
            var photoProperties: PhotoFileProperties = {
                Width: 0,
                Height: 0,
                FileName: fileName,
                FileExtension: fileExtension,
                Size: file.size,
                File: file,
                Message: message,
                isPdf: true
            };
            emitProperties.emit(photoProperties);

        } else if (/(^gif$)|(^png)|(^jpeg)|(^jpg)/gi.test(fileExtension)) {
            let img = new Image();
            img.src = e.target.result + "";
            img.onload = function () {
                let width = img.width;
                let height = img.height;
                message =
                    `File can't be uploaded. May be File Size ${Math.round(file.size)} is grater than ${fileSize} bytes or
                    dimension (${width} x ${height}) is bigger than (${dimensions} is 72 DPI)  of the uploaded
                    \nfile name: ${file.name}`;
                    var photoProperties: PhotoFileProperties = {
                        Width: width,
                        Height: height,
                        FileName: fileName,
                        FileExtension: fileExtension,
                        Size: file.size,
                        File: file,
                        Message: message,
                        isPdf: false,
                        Resize: false
                    };
                if(resize){
                    const canvas = document.createElement('canvas');
                    canvas.width = resizeTo;
                    canvas.height = resizeTo * height / width;
                    const ctx = canvas.getContext('2d');
                    if (ctx != null) {
                    ctx.drawImage(img, 0, 0, resizeTo, resizeTo * height / width);
                    }
                    var data = canvas.toDataURL('image/jpeg', 1);
                    photoProperties.File = data;
                    photoProperties.Resize = true;
                    emitProperties.emit(photoProperties);
                }else emitProperties.emit(photoProperties);
            }
        }

    };
    fileReader.readAsDataURL(file);
}


export function resizeImage(imageURL: any,resizeTo: number = 300): Promise<any> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = function () {
        var width = image.width;
        var height = image.height;
        const canvas = document.createElement('canvas');
        canvas.width = resizeTo;
        canvas.height = resizeTo * height / width;
        const ctx = canvas.getContext('2d');
        if (ctx != null) {
          ctx.drawImage(image, 0, 0, resizeTo, resizeTo * height / width);
        }
        var data = canvas.toDataURL('image/jpeg', 1);
        resolve(data);
      };
      image.src = imageURL;
    });
  }
