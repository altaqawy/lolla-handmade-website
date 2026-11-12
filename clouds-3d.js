/*
  LOLLA Cloudscape · original self-contained WebGL 3D animation.
  Real shaded sphere meshes form volumetric-looking, animated pastel cloud groups.
  No external engine, remote 3D assets, tracking, or animation service required.
  Soft CSS clouds remain visible when WebGL isn't supported.
*/
(() => {
  'use strict';
  const canvas = document.getElementById('lollaCloud3d');
  if (!canvas) return;
  const hero = document.querySelector('.hero');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl', {alpha:true,antialias:true,depth:true,premultipliedAlpha:false,powerPreference:'low-power'});
  if (!gl) return;

  const VS = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform mat4 uMVP;
    uniform mat4 uModel;
    varying vec3 vNormal;
    void main(){
      vNormal = normalize((uModel * vec4(aNormal, 0.0)).xyz);
      gl_Position = uMVP * vec4(aPosition, 1.0);
    }
  `;
  const FS = `
    precision mediump float;
    uniform vec3 uColor;
    varying vec3 vNormal;
    void main(){
      vec3 n = normalize(vNormal);
      vec3 light = normalize(vec3(-0.52, 0.86, 1.0));
      float lambert = max(dot(n, light), 0.0);
      float glow = pow(max(dot(reflect(-light,n), vec3(0.0,0.0,1.0)),0.0), 13.0);
      float rim = pow(1.0 - max(n.z, 0.0), 2.3);
      vec3 shade = uColor * (0.83 + 0.20*lambert) + vec3(0.16)*glow + vec3(0.11)*rim;
      gl_FragColor = vec4(min(shade, vec3(1.0)), 1.0);
    }
  `;
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Shader compilation failed');return s};
  let program;
  try {
    program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,VS));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,FS));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('WebGL shader link failed');
  } catch (error) { console.warn('LOLLA 3D clouds unavailable',error); return; }
  gl.useProgram(program);
  const locations={p:gl.getAttribLocation(program,'aPosition'),n:gl.getAttribLocation(program,'aNormal'),mvp:gl.getUniformLocation(program,'uMVP'),model:gl.getUniformLocation(program,'uModel'),color:gl.getUniformLocation(program,'uColor')};

  function sphereMesh(segments=20,rings=14) {
    const verts=[], norms=[], indices=[];
    for(let y=0;y<=rings;y++)for(let x=0;x<=segments;x++){
      const phi=Math.PI*y/rings, theta=2*Math.PI*x/segments;
      const sx=Math.sin(phi)*Math.cos(theta), sy=Math.cos(phi), sz=Math.sin(phi)*Math.sin(theta);
      verts.push(sx,sy,sz);norms.push(sx,sy,sz);
    }
    for(let y=0;y<rings;y++)for(let x=0;x<segments;x++){
      const a=y*(segments+1)+x,b=a+segments+1;
      indices.push(a,b,a+1,b,b+1,a+1);
    }
    return {verts:new Float32Array(verts),norms:new Float32Array(norms),indices:new Uint16Array(indices)};
  }
  const sphere=sphereMesh();
  const mkBuffer=(target,values)=>{const b=gl.createBuffer();gl.bindBuffer(target,b);gl.bufferData(target,values,gl.STATIC_DRAW);return b};
  const pos=mkBuffer(gl.ARRAY_BUFFER,sphere.verts), norm=mkBuffer(gl.ARRAY_BUFFER,sphere.norms),elements=mkBuffer(gl.ELEMENT_ARRAY_BUFFER,sphere.indices);
  gl.bindBuffer(gl.ARRAY_BUFFER,pos);gl.enableVertexAttribArray(locations.p);gl.vertexAttribPointer(locations.p,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,norm);gl.enableVertexAttribArray(locations.n);gl.vertexAttribPointer(locations.n,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,elements);
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);

  const I=()=>[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  const mul=(a,b)=>{const o=new Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o};
  const translation=(x,y,z)=>{const m=I();m[12]=x;m[13]=y;m[14]=z;return m};
  const rotationY=(a)=>{const m=I();m[0]=Math.cos(a);m[2]=-Math.sin(a);m[8]=Math.sin(a);m[10]=Math.cos(a);return m};
  const rotationZ=(a)=>{const m=I();m[0]=Math.cos(a);m[1]=Math.sin(a);m[4]=-Math.sin(a);m[5]=Math.cos(a);return m};
  const scale=(x,y,z)=>{const m=I();m[0]=x;m[5]=y;m[10]=z;return m};
  const perspective=(fov,aspect,near,far)=>{const f=1/Math.tan(fov/2),m=new Array(16).fill(0);m[0]=f/aspect;m[5]=f;m[10]=(far+near)/(near-far);m[11]=-1;m[14]=2*far*near/(near-far);return m};
  const cloudPuffs=[
    [ 0,-.20, .00,1.48,.49,.78],
    [-.67,.02,.17,.74,.67,.67],
    [-.03,.39,-.05,1.03,.82,.72],
    [.73,.07,-.14,.75,.68,.65],
    [.29,-.13,.35,.83,.60,.75]
  ];
  const cloudGroups=[
    {x:-5.55,y:1.85,z:-2.3,s:1.07,phase:0,seed:1,tint:[.992,.984,1.00]},
    {x:5.55,y:2.05,z:-2.2,s:.93,phase:1.3,seed:2,tint:[1.00,.971,.990]},
    {x:4.85,y:-2.72,z:-2.7,s:.87,phase:2.2,seed:3,tint:[.994,.974,.995]},
    {x:-5.2,y:-2.65,z:-2.6,s:.82,phase:3.7,seed:4,tint:[.975,.981,1.00]},
    {x:.3,y:3.75,z:-5.0,s:.92,phase:4.6,seed:5,tint:[.982,.974,1.00]}
  ];
  const pearls=[
    [-3.7,3.12,-1.3,.13,[1.0,.88,.94]],
    [4.05,3.50,-1.5,.11,[.92,.87,1.0]],
    [-4.25,-.70,-1.6,.09,[1.0,.88,.95]],
    [5.88,-.46,-1.6,.13,[1.0,.90,.96]],
    [3.45,-3.32,-1.6,.10,[.92,.91,1.0]],
    [-3.05,-3.12,-1.6,.10,[1.0,.90,.97]]
  ];

  const drawSphere=(viewProj,x,y,z,sx,sy,sz,rot,color)=>{
    const model=mul(translation(x,y,z),mul(rotationY(rot),mul(rotationZ(rot*.25),scale(sx,sy,sz))));
    const mvp=mul(viewProj,model);
    gl.uniformMatrix4fv(locations.mvp,false,new Float32Array(mvp));
    gl.uniformMatrix4fv(locations.model,false,new Float32Array(model));
    gl.uniform3f(locations.color,color[0],color[1],color[2]);
    gl.drawElements(gl.TRIANGLES,sphere.indices.length,gl.UNSIGNED_SHORT,0);
  };

  let running=false,visible=true,frame=0,last=0,width=0,height=0,cameraX=0,targetX=0,targetY=0,cameraY=0;
  const onPointer=(e)=>{if(reduce.matches||innerWidth<820)return;const b=hero.getBoundingClientRect();targetX=((e.clientX-b.left)/b.width-.5)*.65;targetY=((e.clientY-b.top)/b.height-.5)*.38};
  const onLeave=()=>{targetX=0;targetY=0};
  hero.addEventListener('pointermove',onPointer,{passive:true});hero.addEventListener('pointerleave',onLeave);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&!running)start();},{threshold:0});observer.observe(hero);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!running)start()});
  const onReduce=()=>{if(!running)render(performance.now(),true)};
  if(reduce.addEventListener)reduce.addEventListener('change',onReduce);

  function resize(){
    const r=canvas.getBoundingClientRect();
    const dpr=Math.min(devicePixelRatio||1,innerWidth<760?1:1.45);
    const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));
    if(w===width&&h===height)return;
    width=w;height=h;canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);
  }
  function render(ms,staticOnly=false){
    resize();if(!width||!height)return;
    const t=staticOnly?0:ms*.001;
    cameraX+=(targetX-cameraX)*.055;cameraY+=(targetY-cameraY)*.055;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const aspect=width/height;
    // Wider horizontal scene for landscape; portrait keeps floating clouds near the edges.
    const proj=perspective(Math.PI/3.02,aspect,.1,70);
    const view=mul(translation(cameraX*.35,cameraY*.35,-16),rotationY(cameraX*.08));
    const vp=mul(proj,view);
    const wide=aspect<1?Math.max(.5,aspect*1.5):1;
    cloudGroups.forEach(c=>{
      const x=c.x*wide + Math.sin(t*.13+c.phase)*.21;
      const y=c.y + Math.sin(t*.39+c.phase)*.15;
      const rot=Math.sin(t*.12+c.phase)*.18;
      cloudPuffs.forEach((p,i)=>{
        const light=i===2?1:i===1?.986:i===4?.966:.978;
        drawSphere(vp,x+p[0]*c.s,y+p[1]*c.s,c.z+p[2]*c.s,p[3]*c.s,p[4]*c.s,p[5]*c.s,rot,c.tint.map(v=>v*light));
      });
    });
    pearls.forEach(([x,y,z,size,color],i)=>{
      const bob=Math.sin(t*.75+i*1.4)*.15;
      drawSphere(vp,x*wide,y+bob,z,size,size,size,t*.3+i*.8,color);
    });
  }
  function tick(ms){
    if(!visible||document.hidden){running=false;return}
    if(reduce.matches){render(ms,true);running=false;return}
    if(ms-last>=34){render(ms);last=ms}
    frame=requestAnimationFrame(tick);
  }
  function start(){if(running)return;running=true;frame=requestAnimationFrame(tick)}
  window.addEventListener('resize',()=>{resize();if(reduce.matches)render(0,true)},{passive:true});
  canvas.classList.add('is-supported');
  start();
})();
