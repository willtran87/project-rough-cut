// Fetch, decode and orient away from the UI thread. Transfer the bitmap, not a
// second pixel array. Serial work avoids a burst of parallel image decoders.
let queue=Promise.resolve();
self.onmessage=({data})=>{
  queue=queue.then(async()=>{
    const bitmaps=[];
    try{
      const response=await fetch(data.url);if(!response.ok)throw Error('Image fetch failed: '+response.status);
      const blob=await response.blob();
      if(data.slices){
        for(const [start,end] of data.slices){
          if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<=start||end>blob.size)throw Error('Invalid bitmap archive slice');
          bitmaps.push(await createImageBitmap(blob.slice(start,end,'image/png'),data.options));
        }
        self.postMessage({id:data.id,bitmaps},bitmaps);
      }else{
        const bitmap=await createImageBitmap(blob,data.options);
        self.postMessage({id:data.id,bitmap},[bitmap]);
      }
    }catch(error){for(const bitmap of bitmaps)bitmap.close();self.postMessage({id:data.id,error:String(error)});}
  });
};
