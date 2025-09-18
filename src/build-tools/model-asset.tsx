export class FileData {
    filePathName: string;
    extension?: string;

    constructor(filePathName: string, extension: string = "") {
        this.filePathName = filePathName;
        this.extension = extension;
    }
}

export class AssetData {
    id: string;
    originFilePathName: string;
    computedFilePathName: string

    classes: string[];

    constructor(id: string, originFilePathName: string, computedFilePathName: string, classes: string[]=[]) {
        this.id = id;
        this.originFilePathName = originFilePathName;
        this.computedFilePathName = computedFilePathName;
        this.classes = classes;
    }


}

export class AssetCollection {
    id: string;
    description?: string;
    assets: AssetData[];
    custom: boolean=false;// indique si la collection a été généré automatiquement ou créé par les devs

    constructor(id: string, assets: AssetData[]=[], description: string="") {
        this.id = id;
        this.description = description;
        this.assets = assets;
    }
}

export class AssetsDatas {
    fileDatas: FileData[];
    collections: AssetCollection[];

    constructor(fileDatas: FileData[], collections: AssetCollection[]) {
        this.fileDatas = fileDatas;
        this.collections = collections;
    }

}
