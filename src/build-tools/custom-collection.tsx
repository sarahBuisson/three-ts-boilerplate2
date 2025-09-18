import { AssetCollection, AssetsDatas } from './model-asset';



function buildCollectionWithAsset(id:string, assetPathIds:string[], datas:AssetsDatas):AssetCollection{
    const newCollection = new AssetCollection(id);
    newCollection.assets.filter(asset => assetPathIds.includes(asset.id))
    newCollection.custom = true

    return newCollection

}
export function buildCustomCollections(datas:AssetsDatas){

    buildCollectionWithAsset("fishCustom", ["fish1", "fish2", "fish3"], datas)
    buildCollectionWithAsset("alguaeCustom", ["fish1", "fish2", "fish3"], datas)
    buildCollectionWithAsset("forestTree", ["tree1", "tree2", "tree3"], datas)




}
