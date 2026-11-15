// Same conservative coverage test as web/raster-visibility.js. No libc or
// system imports; compiled for the browser's WebAssembly runtime.
typedef unsigned int U32;
#if defined(RASTER_SIMD)
typedef double V2D __attribute__((vector_size(16)));
#endif
static double absd(double x){return __builtin_fabs(x);}
static double min3(double a,double b,double c){return a<b?(a<c?a:c):(b<c?b:c);}
static double max3(double a,double b,double c){return a>b?(a>c?a:c):(b>c?b:c);}
static int samples(double ax,double ay,double bx,double by,double cx,double cy,int side){
 const double margin=.125,abx=bx-ax,aby=by-ay,acx=cx-ax,acy=cy-ay,area=abx*acy-aby*acx;
 const double error=(absd(abx)+absd(aby)+absd(acx)+absd(acy))*margin*2+margin*margin*8;
 if((side==0&&area< -error)||(side==1&&area>error))return 0;
 const int left=(int)__builtin_ceil(min3(ax,bx,cx)-.5-margin),right=(int)__builtin_floor(max3(ax,bx,cx)-.5+margin);
 const int bottom=(int)__builtin_ceil(min3(ay,by,cy)-.5-margin),top=(int)__builtin_floor(max3(ay,by,cy)-.5+margin);
 if(left>right||bottom>top)return 0;
 if((double)(right-left+1)*(top-bottom+1)>4||absd(area)<=error)return 1;
 const double sign=area>0?1:-1,bcx=cx-bx,bcy=cy-by,cax=ax-cx,cay=ay-cy;
 const double abError=-(absd(abx)+absd(aby))*margin*2,bcError=-(absd(bcx)+absd(bcy))*margin*2,caError=-(absd(cax)+absd(cay))*margin*2;
 for(int x=left;x<=right;x++)for(int y=bottom;y<=top;y++){
  const double px=x+.5,py=y+.5;
  if(sign*(abx*(py-ay)-aby*(px-ax))>=abError&&sign*(bcx*(py-by)-bcy*(px-bx))>=bcError&&sign*(cax*(py-cy)-cay*(px-cx))>=caError)return 1;
 }
 return 0;
}
static void project(U32 id,const float *positions,double *projected,U32 *stamps,U32 stamp,const double *e,double width,double height,U32 *transformed){
 if(stamps[id]==stamp)return;
 stamps[id]=stamp;(*transformed)++;
 const U32 k=id*3;const double x=positions[k],y=positions[k+1],z=positions[k+2],w=e[3]*x+e[7]*y+e[11]*z+e[15];
#if defined(RASTER_SIMD)
 // Two independent double-precision projections, with the scalar arithmetic
 // order intact. No approximate division, reduced precision or fast-math.
 const V2D clip=(V2D){e[0],e[1]}*x+(V2D){e[4],e[5]}*y+(V2D){e[8],e[9]}*z+(V2D){e[12],e[13]};
 const V2D pixel=((V2D){1,1}+clip/w)*(V2D){width,height}*.5;
 projected[k]=pixel[0];projected[k+1]=pixel[1];projected[k+2]=w;
#else
 projected[k]=(1+(e[0]*x+e[4]*y+e[8]*z+e[12])/w)*width*.5;
 projected[k+1]=(1+(e[1]*x+e[5]*y+e[9]*z+e[13])/w)*height*.5;projected[k+2]=w;
#endif
}
__attribute__((export_name("update")))
U32 update(const float *positions,const U32 *source,U32 *index,double *projected,U32 *stamps,const double *e,const U32 *parts,U32 partCount,double width,double height,int side,U32 stamp,U32 *result){
 U32 count=0,first=0xffffffff,last=0,tested=0,transformed=0;
 for(U32 p=0;p<partCount;p++)for(U32 i=parts[p*2],end=i+parts[p*2+1];i<end;i+=3){
  const U32 a=source[i],b=source[i+1],c=source[i+2];
  project(a,positions,projected,stamps,stamp,e,width,height,&transformed);
  project(b,positions,projected,stamps,stamp,e,width,height,&transformed);
  project(c,positions,projected,stamps,stamp,e,width,height,&transformed);tested++;
  const U32 aa=a*3,bb=b*3,cc=c*3;
  const int safe=projected[aa+2]>.5&&projected[bb+2]>.5&&projected[cc+2]>.5&&
   max3(absd(projected[aa]),absd(projected[bb]),absd(projected[cc]))<width*8&&
   max3(absd(projected[aa+1]),absd(projected[bb+1]),absd(projected[cc+1]))<height*8;
  if(safe&&!samples(projected[aa],projected[aa+1],projected[bb],projected[bb+1],projected[cc],projected[cc+1],side))continue;
  if(index[count]!=a||index[count+1]!=b||index[count+2]!=c){index[count]=a;index[count+1]=b;index[count+2]=c;if(count<first)first=count;last=count+3;}
  count+=3;
 }
 result[0]=first;result[1]=last;result[2]=tested;result[3]=count/3;result[4]=transformed;return count;
}
