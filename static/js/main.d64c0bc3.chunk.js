(this["webpackJsonpthree-js-playground"]=this["webpackJsonpthree-js-playground"]||[]).push([[0],{14:function(e,n,t){},17:function(e,n,t){"use strict";t.r(n);var i=t(3),a=t.n(i),r=t(7),s=t.n(r),o=(t(14),t(0)),c=t(1),d=t(2),h=t(9),u=t(8),w=t.n(u),p=t.p+"static/media/corona_bk.97e76adb.png",l=t.p+"static/media/corona_dn.47349e0d.png",m=t.p+"static/media/corona_ft.7254c08d.png",f=t.p+"static/media/corona_lf.b29e8c04.png",b=t.p+"static/media/corona_rt.287e832e.png",x=t.p+"static/media/corona_up.782ec698.png",g=function(){function e(n){Object(o.a)(this,e),this.containerElement=n,this.init(),this.initHelpers(),this.addBox(),this.animate()}return Object(c.a)(e,[{key:"init",value:function(){var e=this;this.scene=new d.o,this.scene.background=new d.d(13426943),this.camera=new d.m(75,window.innerWidth/window.innerHeight,.1,1e5),this.camera.position.set(25,25,25),this.camera.lookAt(0,0,0),this.renderer=new d.u({antialias:!0}),this.renderer.setPixelRatio(2*window.devicePixelRatio),this.renderer.setSize(window.innerWidth,window.innerHeight),this.containerElement.appendChild(this.renderer.domElement),this.controls=new h.a(this.camera,this.renderer.domElement),this.controls.minDistance=0,this.controls.maxDistance=1e3,this.stats=new w.a,this.containerElement.appendChild(this.stats.dom),window.addEventListener("resize",(function(){e.camera.aspect=window.innerWidth/window.innerHeight,e.camera.updateProjectionMatrix(),e.renderer.setSize(window.innerWidth,window.innerHeight)}))}},{key:"addBox",value:function(){var e=new d.c(10,10,10),n=new d.e(e),t=new d.i(n,new d.h({color:0})),i=new d.l({color:15724527}),a=new d.k(e,i);this.boxGroup=new d.g,this.boxGroup.add(t,a),this.scene.add(this.boxGroup);var r=[];[m,p,x,l,b,f].forEach((function(e){var n=(new d.r).load(e),t=new d.l({map:n});t.side=d.b,r.push(t)}));var s=new d.c(1e4,1e4,1e4),o=new d.k(s,r);this.scene.add(o)}},{key:"initHelpers",value:function(){this.axesHelper=new d.a(10),this.scene.add(this.axesHelper)}},{key:"render",value:function(){this.renderer.render(this.scene,this.camera)}},{key:"simulate",value:function(e){this.boxGroup.rotation.x+=.005,this.boxGroup.rotation.y+=.005}},{key:"animate",value:function(e){requestAnimationFrame(this.animate.bind(this)),this.simulate(e),this.render(),this.stats.update()}}]),e}(),v=t(4),j=function(){var e=Object(i.useRef)();return Object(i.useEffect)((function(){new g(e.current)}),[]),Object(v.jsx)("section",{ref:e})};s.a.render(Object(v.jsx)(a.a.StrictMode,{children:Object(v.jsx)(j,{})}),document.getElementById("root"))}},[[17,1,2]]]);
//# sourceMappingURL=main.d64c0bc3.chunk.js.map