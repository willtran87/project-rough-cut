export const KEEPER_TIMBER_SPAN=4;
export const KEEPER_TIMBER_ASSET='keeper-timber-v1.webp';

export async function loadKeeperTimber(){
 const image=new Image();image.src='./assets/under-green/'+KEEPER_TIMBER_ASSET;
 await image.decode();
 if(!image.naturalWidth||!image.naturalHeight)throw Error('Keeper timber artwork is empty');
 return image;
}
