var $window,
$body;
var SlideShow = function (container, config) {
    this.container = container;
    if(typeof (config) !== "undefined") {
        this.gutter = config.gutter || this.gutter;
        this.aspect = config.aspect || this.aspect;
    }
    this.build();
};

SlideShow.prototype = {
    aspect: 0.75,
    position: 0,
    slides: 0,
    container: "",
    lang: "en",
    sH: 0,
    sW: 0,
    gutter: 0,
    build: function () {
        var bgAspect = this.aspect,
            self = this;
        self.sH = $(window).height() - self.gutter;
        self.sW = self.sH * bgAspect;
        var slideObj = $("#" + self.container);
        self.slides = slideObj.children().length;
        var l = self.slides.length;
        slideObj.parent().find(".ss-nav").fadeIn().children().on("click", function (e) {
            self.onSlideNav(e, self)
        }).eq(1).hide().parent().children().eq(0).show();
        slideObj.children().height(self.sH).width(self.sW).find("img").height(self.sH).width(self.sW);
        self.onResize();
        $(window).off(".slideshow").on("resize.slideshow", function (e) {
            self.onResize(e);
        });
        $(document).off(".slideshow").on("keydown.slideshow", function (e) {
            self.onKey(e, self);
        })
        .on("mousewheel.slideshow", function(e){
            self.onWheel(e, self);
        });
        // if(Modernizr.csstransitions){
        // if($("img").imagesLoaded()) {
        //     slideObj.find("img").each(function (n, i) {
        //         $(i).imagesLoaded(function ($img) {
        //             $img.addClass("loaded");
        //         });
        //     });
        // }
        // }
        // else {
        //     $("img").addClass("loaded");
        // }

        slideObj.touchify({fPrev: function(){
             self.position--;
             self.animateSlides();
        }, fNext: function(){
             self.position++;
             self.animateSlides();
        }
        // ,
        // onMove: function(y,x){self.onTouchMove(self,x,y)},
        // onEnd: function(){
        //     self.animateSlides();
        //     self.currentTouch = 0;
        // }
        });
        return self;
    },
    currentTouch: 0,
    onTouchMove: function(self,x,y){
         var self = this,
            left = 0,
            slideObj = $("#" + self.container),
            currentLeft = 1 * $("#" + self.container).css("left").replace("px", ""),
            slides = slideObj.children(),
            position = 0,
            maxPosition = 0,
            adjustLeft = 0,
            slideWidth = 0,
            scrollWidth = $(window).width()*0.33,
            minWidth = scrollWidth,
            deltaTouch = 0;

           for(var i = 0; i < self.slides; i++) {
            if(i < self.position) {
                position += slides.eq(i).outerWidth(true);
            }
            maxPosition += slides.eq(i).outerWidth(true);
            slideWidth = Math.max(slides.eq(i).outerWidth(true), slideWidth);
        }
        //   }
        left = Math.max(-maxPosition + $(window).width(), -position);
        left -= x;
        left = Math.min(left,0);
        left = Math.max(left, -maxPosition + $(window).width());
        minWidth = slideWidth;
        console.log(Math.floor(x/minWidth));
     //   console.log(slideWidth + " / " + x);
        if(Math.abs(x) > minWidth){
            deltaTouch = Math.round(x/minWidth);
            self.position += (deltaTouch-self.currentTouch);
            self.currentTouch = deltaTouch;
        }
        if(Modernizr.csstransforms3d) {
            $("#" + self.container).css({
                "-webkit-transform": "translate3d(" + left + "px,0,0)",
                        "-o-transform":"translate3d("+left+"px,0,0)",
                        "-moz-transform":"translate3d("+left+"px,0,0)",
                        "transform":"translate3d("+left+"px,0,0)"
            });
        }
    },
    onKey: function (e, self) {
        if(!$("#" + self.container).length) self.destroy();
        if(e.keyCode == 37 || e.keyCode == 39) {
            if(e.keyCode == 39) {
                self.position++;
            } else {
                self.position--;
            }
            self.animateSlides();
            return;
        }
        //  if(e.keyCode == 27)
        //self.destroy();
    },
    delayWheel: null,
    onWheel: function(e, self){
        clearTimeout(self.delayWheel);

        if(!$("#" + self.container).length) {
             self.destroy();
             return true;
        }

        if(Zoom.isZoomed) return true;

        e.preventDefault();

        // var delta = -e.originalEvent.wheelDelta,
        // increment = Math.max(1,Math.min(3,Math.abs(delta)/20));

        // if(delta > 20){
        //     self.position+=increment;
        //     self.position = Math.min(self.slides-1, self.position);
        //     self.animateSlides();
        //     return;
        // }
        // if(delta < -20){
        //     self.position-=increment;
        //     self.position = Math.max(0, self.position);
        //     self.animateSlides();
        // }

        // return;

        self.delayWheel = setTimeout(function(){
            self.delayedOnWheel(-e.originalEvent.wheelDelta, self);
        }, 50);
    },
    delayedOnWheel: function(delta, self){

        var increment = Math.max(1,Math.min(3,Math.abs(delta)/20));
        if(delta > 0){
            self.position+=increment;
            self.position = Math.min(self.slides-1, self.position);
            self.animateSlides();
            return;
        }
        if(delta < -0){
            self.position-=increment;
            self.position = Math.max(0, self.position);
            self.animateSlides();
        }
    },
    delayResize: null,
    onResize: function () {
        var self = this,
            tW = 0;
        clearTimeout(self.delayResize);
        self.delayResize = setTimeout(function () {
            self.sH = $(window).height() - self.gutter;
            //   self.openW = self.sW + 240;
            $("#" + self.container).children().each(function (i, s) {
                var aspect = ($(s).data("width")>0) ? $(s).data("width")/self.sH : $(s).find("img").data("aspect") || self.aspect,
                sW = self.sH * aspect; //$(s).find("img").data("aspect");
                tW += sW + 6;
                $(s).height(self.sH).width(sW).find("img").height(self.sH).width(sW);
            });
            self.animateSlides();
            $("#" + self.container).width(tW).height(self.sH);
        }, 100);
    },
    slide: function (direction) {},
    onSlideNav: function (e, self) {
        e.preventDefault();
        // if($(e.currentTarget).index() == 2) {
        //     self.destroy();
        //     return;
        // }
        var dir = 1;
        if($(e.currentTarget).index() == 1) {
            dir = -1;
        }
        self.position += dir;
        if(self.position < 0) {
            self.position = 0;
            return;
        }
        self.animateSlides();
    },
    animateSlides: function () {
        var self = this,
            left = 0,
            slideObj = $("#" + self.container),
            addOpen = 0,
            lastOpen = 0,
            currentLeft = 1 * $("#" + self.container).css("left").replace("px", ""),
            open = slideObj.find(".open"),
            slides = slideObj.children(),
            position = 0,
            maxPosition = 0,
            adjustLeft = 0;
        if(self.position < 0) {
            self.position = 0;
        }
        if(self.position >= self.slides - 1) {
            self.position = self.slides - 1;
            if(slides.eq(self.position).hasClass("open")) {
                //      adjustLeft = -240;
            }
        }
        // if(open){
        for(var i = 0; i < self.slides; i++) {
            if(i < self.position) {
                position += slides.eq(i).outerWidth(true);
            }
            maxPosition += slides.eq(i).outerWidth(true);
        }
        //   }
        left = Math.max(-maxPosition + $(window).width(), -position);
        left += adjustLeft;
        var className = (currentLeft < left) ? "animating-next" : "animating-prev";
        if(!Modernizr.csstransforms3d) {
            $("#" + self.container).stop(true, true).addClass(className).animate({
                left: left + "px"
            }, 800, "easeOutQuad", function(){
                $(this).removeClass("animating-next").removeClass("animating-prev");
            });
        } else {
            $("#" + self.container).addClass(className).css({
                "-webkit-transform": "translate3d(" + left + "px,0,0)",
                        "-o-transform":"translate3d("+left+"px,0,0)",
                        "-moz-transform":"translate3d("+left+"px,0,0)",
                        "transform":"translate3d("+left+"px,0,0)"
            });
            setTimeout(function () {
                $("#" + self.container).removeClass("animating-next").removeClass("animating-prev");
            }, 600);
        }
        if(self.position > 0) {
            slideObj.parent().find(".ss-nav").children().eq(1).stop(true, true).fadeIn(400);
        } else {
            slideObj.parent().find(".ss-nav").children().eq(1).stop(true, true).fadeOut(400);
        }
        if(self.position < self.slides - 1) {
            slideObj.parent().find(".ss-nav").children().eq(0).stop(true, true).fadeIn(400);
        } else {
            slideObj.parent().find(".ss-nav").children().eq(0).stop(true, true).fadeOut(400);
        }
    },
    destroy: function () {
        $(window).off(".slideshow");
        $(document).off(".slideshow");
        //         var self = this;
        //        // $("#" + self.container).parent().fadeOut(400, function () {
        //         setTimeout(function(){
        //             $("#" + self.container).parent().find(".ss-nav").off("click");
        //             $("#" + self.container).remove();
        //             self = {};
        //         }, 1000);
        // //        }).find("a").off("click");
        //         $(document).unbind(".ss13slideshow");
        //         $("#ss2013-slide-wrap").parent().removeClass("shifted-left");
    }
};
var Site = {
    lang: null,
    init: function () {
        if(navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") == -1){
            Modernizr.csstransforms3d = false;
        }
        Site.lang = $("html").attr("lang");
        $window = $(window), $body = $("body");
        Fallbacks.init();
        HistoryObj.init();
        if(!Modernizr.touch) $(document).mousewheel(Site.onWheel).keydown(Site.onKey);
        $window //.scroll(Site.onScroll)
        .resize(Site.onResize);
        $("p, h3").each(function (i, o) {
            $(o).html($(o).html().replace(/( [A-Za-z]) {1}/g, "$1" + "&nbsp;"));
        });

        Site.scrollToArticle(false);
        Site.onLoad();
        Site.onResize();
        if(!Modernizr.touch) {
            Site.skrollr = skrollr.init({
                render: Site.onRender
            });
        }
        Newsletter.init();
        Site.onResize();
    },
    skrollr: null,
    blockSpace: false,
    onKey: function (e) {
        if(Site.blockSpace) return;
        if($("input:focus, textarea:focus").length) return;
        if($("#project").length && (e.keyCode == 37 || e.keyCode == 39)) {
            if(e.keyCode == 39) {
                $("#project").find(".next").trigger("click");
            } else {
                $("#project").find(".prev").trigger("click");
            }
        }
        if(e.keyCode != 32 && e.keyCode != 38 && e.keyCode != 40) return;
        e.preventDefault();
        var articles = $("article"),
            now = new Date().getTime(),
            animTime = 600,
            l = articles.length,
            i = l - 1,
            found = 0,
            scrollto = null;
        while(i >= 0 && found == 0) {
            if($window.scrollTop() >= $(articles[i]).offset().top - 100) {
                found = i;
            }
            i--;
        }
        if((e.shiftKey || e.keyCode == 38) && found > 0) {
            scrollto = found - 1;
        } else if((!e.shiftKey || e.keyCode == 40) && found != (l - 1)) {
            scrollto = found + 1;
        } else {
            scrollto = found;
        }
        if(found != scrollto) {
            Site.lastScroll = now;
            $('html,body').stop(true, true).animate({
                scrollTop: $(articles[scrollto]).offset().top
            }, animTime);
        }
        //  Site.checkEnd();
    },
    onLoad: function () {
        $("header").attr("class","");
        $("#newsletter").find(".open").removeClass("open");
        HistoryObj.overwriteLinks();
        // Site.copy();
        Site.image();
        Site.subPage();
        Lookbook.init();
        if($("#hero").length) {
            $("#hero").simpleShow({
                auto: 4,
                speedIn: 1500,
                speedOut: 1800,
                controls: false
            });
        }
        Campaign.init();
        Backstage.init();
        TextPage.init();
        Map.init();
        if(Site.skrollr) {
            Site.skrollr.refresh();
        }
       
        Zoom.init();
        Site.activeLinks();
    },
    activeLinks: function(){
        $(".active").removeClass("active");
        $("a[href='"+window.location.pathname+"']").addClass("active");
        var paths = window.location.pathname.split("/");
        $("#menu").find("a[href^='"+paths[0]+"/"+paths[1]+"/"+paths[2]+"']").addClass("active");
        if($("#menu").find(".active").length){
            $("#menu").addClass("active");
        }
    },
    image: function () {
        if(Modernizr.csstransitions) {
            $("article img").each(function (i, o) {
                if($(o).css("opacity") != 0) return;
                $(o).imagesLoaded(function ($img) {
                    $img.cssanimate({
                        opacity: 1
                    }, 800);
                })
            });
        }
    },
    scrollToArticle: function (animate) {
        if(typeof (animate) === "undefined") {
            animate = 800;
        } else {
            animate = 0;
        }

        if(window.location.pathname.split("/")[3]){
                var targetScroll = 0;
                if($("[data-path*='/"+window.location.pathname.split("/")[3]+"']").length){
                    targetScroll = ($("[data-path*='/"+window.location.pathname.split("/")[3]+"']").offset().top);
                    if($("#about").length)  targetScroll-=103;
                }
                //if($("[data-path*='/"+window.location.pathname.split("/")[3]+"']").length){
                $("html,body").animate({scrollTop: targetScroll+"px"},animate);
                //}
        }
    },
    updatePage: function (o) {
    },
    readMore: function () {
        $(".more").bind("click", function (e) {
            e.preventDefault();
            //$(this).slideUp(600);
            if($(this).find("span").html() == "Czytaj dalej") {
                $(this).find("span").html("Zamknij");
            } else if($(this).find("span").html() == "Zamknij") {
                $(this).find("span").html("Czytaj dalej");
                $("html,body").stop(true, true).animate({
                    scrollTop: $(this).parent().find(".more-content").offset().top - 400 + "px"
                }, 600);
            } else if($(this).find("span").html() == "Read more") {
                $(this).find("span").html("Close");
            } else if($(this).find("span").html() == "Close") {
                $(this).find("span").html("Read more");
                $("html,body").stop(true, true).animate({
                    scrollTop: $(this).parent().find(".more-content").offset().top - 400 + "px"
                }, 600);
            }
            $(this).parent().find(".more-content").removeClass("hidden").slideToggle(900);
        });
    },
    onResize: function () {
        if($("#about").length){
            var h = $window.height()-103,
            w = $window.width();
            if(Modernizr.backgroundsize && !Modernizr.touch) {
            $(".about .img").each(function(n,i){
                var aspect = $(i).data("aspect"),
                x = ($(i).closest(".about").hasClass("right-aligned")) ? Math.round(w/2 - (h-103)*aspect - 20) : w/2-20;
                $(i).css({
                    height: h+"px",
                    backgroundSize: "auto "+h+"px",
                    backgroundPosition: x+"px 103px",
                    height: "100%"
                });
            });
            }
        }
        //$(".hero").find("li").css({height: $window.height()-160+"px"});
    },
    lastScroll: 0,
    onWheel: function (e, d) {
        //console.log(e);
        return;
        var articles = $("article"),
            now = new Date().getTime(),
            animTime = 600,
            pauseFor = 800,
            margin = 250,
            l = articles.length,
            i = l - 1,
            found = 0,
            scrollto = null;
        while(i >= 0 && found == 0) {
            if($window.scrollTop() + 80 >= $(articles[i]).offset().top) {
                found = i;
            }
            i--;
        }
        if($(articles[found]).offset().top + $(articles[found]).height() > $window.scrollTop() + 400) {
            return;
        }
        if(now - Site.lastScroll < pauseFor + animTime) {
            e.preventDefault();
            return;
        }
        if(d > 0 && found != 0) {
            scrollto = found - 1;
        } else if(d < 0 && found != (l - 1)) {
            scrollto = found + 1;
        } else {
            scrollto = found;
        }
        if(found != scrollto) {
            Site.lastScroll = now;
            $('html,body').animate({
                scrollTop: $(articles[scrollto]).offset().top - 100
            }, animTime, 'swing');
        }
    },
    subPage: function () {
        if($("#project").length) {
            $body.addClass("fixed").addClass("project-page");
            $("#menu").css({
                top: "0",
                marginTop: "120px"
            });
        } else {
            $body.removeClass("project-page");
        }
    },
    onRender: function (e, once) {
        if($("#project").length) {
            Site.subPage();
            return;
        }
        if(!Modernizr.touch) {
            //  if(e.curTop > 27){   
            //        $body.addClass("fixed");
            //    }
            //    else {          
            //      $body.removeClass("fixed");
            //  }   
            // // if(e.curTop != 0){   
            //      var top = Math.max(e.curTop, 0),
            //      menuTop = Math.min(1,1.25 * top / $window.height());
            //      $("#menu").css({top: (1-menuTop)*100+"%", marginTop: (menuTop-1)*250+120+"px"});
            // // }
        }
        var articles = $("article"),
            l = articles.length,
            i = l - 1,
            found = 0;
        while(i >= 0 && found == 0) {
            if($window.scrollTop() >= $(articles[i]).offset().top - 200) {
                found = i;
            }
            i--;
        }
        if(found >= 0) {
            HistoryObj.noscroll = true;
            if(Modernizr.history) {
                var id = $(articles[found]).attr("data-path");// || $(articles[found]).attr("id");
                if(id != window.location.pathname.split("/")[2]) window.History.pushState(null, null,'');
            }
        }
        clearTimeout(Site.scrollTime);
        if(typeof (once) === "undefined") Site.scrollTime = setTimeout(function () {
            Site.onRender(e, "once")
        }, 500);
    },
    onScroll: function () {
        if($("#project").length) {
            Site.subPage();
            return;
        }
        if(!Modernizr.touch) {
            if($window.scrollTop() > 30) {
                $body.addClass("fixed");
            } else {
                $body.removeClass("fixed");
            }
            if($window.scrollTop() != 0) {
                var top = Math.max($window.scrollTop(), 0);
                // if(!Modernizr.backgroundsize){
                //     if($window.scrollTop() < $window.height()) {
                //         $(".hero").find("li").css({top: Math.round(top*0.8) + "px"});                
                //     }
                // }
                // var menuTop = Math.min(1,1.25 * top / $window.height());
                // $("#menu").css({top: (1-menuTop)*100+"%", marginTop: (menuTop-1)*250+120+"px"});
            }
        }
        var articles = $("article"),
            l = articles.length,
            i = l - 1,
            found = 0;
        while(i >= 0 && found == 0) {
            if($window.scrollTop() >= $(articles[i]).offset().top - 200) {
                found = i;
            }
            i--;
        }
        if(found >= 0) {
            HistoryObj.noscroll = true;
            if(Modernizr.history) {
                var id = $(articles[found]).attr("id") || $(articles[found]).attr("data-id");
                if(id != window.location.pathname.split("/")[2]) window.History.pushState(null, null, '');
            }
        }
        clearTimeout(Site.scrollTime);
        Site.scrollTime = setTimeout(Site.onScroll, 500);
    }
};
var Newsletter = {
    init: function(){
        $("#newsletter").find("form").on("submit", Newsletter.onSubscribe);
        $("#newsletter").find("span").on("click", function(e){
            e.preventDefault();
            $("#newsletter").find(".newsletter").toggleClass("open");
        });
    },
    onSubscribe: function (e) {
        e.preventDefault();
        var send = {
            email: $(e.currentTarget).find("input").val(),
            lang: Site.lang
        };
        $.ajax({
            url: $(e.currentTarget).attr("action"),
            global: false,
            type: 'POST',
            data: send,
            dataType: 'json',
            async: true,
            success: function (data) {
               if (data.result) {
                    Newsletter.subscribeSuccess(data.response);
                }
                else {
                    Newsletter.subscribeError(data.response);
                }
            }
        });
    },
    subscribeError: function (data) {
        alert(data);
    },
    subscribeSuccess: function(data){
        $("#newsletter").find("form").fadeOut(400, function(){
            $(this).after("<div>"+data+"</div>");
        });
        setTimeout(function(){
            if($("#newsletter").find(".open").length)
                $("#newsletter").find(".open").removeClass("open");
        }, 3000);
    }
};
var TextPage = {
    init: function(){
        if(!$("#about").length) return;
        $("header").attr("class","text");
        Site.onResize();
        if(Modernizr.backgroundsize && !Modernizr.touch) {
            $(".about").find("img").each(function(i,o){
                var src = $(o).attr("src");
                $(o).parent().css({backgroundImage: "url('"+src+"')"});
            }).remove();
        }
        $(window).on("resize.about", TextPage.onResize);
        TextPage.onResize();
    },
    onResize: function(){
        if(!$("#about").length) {
            $(window).unbind(".about");
            return;
        }
        var h = $(window).height()-103;
        $(".about").css({minHeight: h+"px", marginBottom: 0}).find(".container").css({paddingTop: 0, paddingBottom: "42px"}).parent().find(".img").css({top: 0});
        if(Site.skrollr) {
            Site.skrollr.refresh();
        }
    }
};
var Campaign = {
    init: function(){
        if(!$("#campaign").length) return;
            $("header").attr("class","");
            var show = new SlideShow("campaign-slides", {
                gutter: 208
            });
    }
};
var Backstage = {
    init: function(){
        if(!$("#backstage").length) return;
            $("header").attr("class","");
            var show = new SlideShow("backstage-slides", {
                gutter: 208
        });
    }
};
var Fallbacks = {
    init: function () {
        Fallbacks.placeholder();
    },
    placeholder: function () {
        var input = document.createElement('input');
        if('placeholder' in input) return;
        $('[placeholder]').unbind().focus(function () {
            var input = $(this);
            if(input.val() == input.attr('placeholder')) {
                input.val('');
                input.removeClass('placeholder');
            }
        }).blur(function () {
            var input = $(this);
            if(input.val() == '' || input.val() == input.attr('placeholder')) {
                input.addClass('placeholder');
                input.val(input.attr('placeholder'));
            }
        }).blur().parents('form').submit(function () {
            $(this).find('[placeholder]').each(function () {
                var input = $(this);
                if(input.val() == input.attr('placeholder')) {
                    input.val('');
                }
            })
        });
    }
};
var HistoryObj = {
    noChange: false,
    noscroll: false,
    title: "Deni Cler Milano",
    init: function () {
        //if(!Modernizr.history) return;
        window.History.Adapter.bind(window, 'statechange', HistoryObj.onState);
        HistoryObj.setTouchClasses();
    },
    overwriteLinks: function () {
        if(!Modernizr.history) return;
        $('a[data-history], [data-history] a').not("[data-history='false']").off(".history").on("click.history", function (a) {
            a.preventDefault();
            HistoryObj.noscroll = false;
            var state = $(a.currentTarget).attr("href").replace("http://" + document.location.host, "");
            window.History.pushState(null, null,'');
        })
    },
    setTouchClasses: function (_id) {
        var id = _id || window.location.pathname.split("/")[2];
        if(Modernizr.touch && (id != "" && id != "start")) {
            $("header").addClass("fixed");
        } else if(Modernizr.touch) {
            $("header").removeClass("fixed");
        }
    },
    onState: function (e) {
        var id = window.location.pathname.split("/")[2],
        sub = window.location.pathname.split("/")[3];
        HistoryObj.setTouchClasses(id);
      //  console.log(HistoryObj);
        if(HistoryObj.noChange) {
            HistoryObj.noChange = false;
            return;
        }
        if(window.location.pathname.split("/").length > 3 && $("[data-path='"+id+"/"+sub+"']").length) {
            if(!HistoryObj.noscroll) {
               Site.scrollToArticle();
            }
        }  
        else if( !HistoryObj.noscroll) {
            $body.children().not("header, footer").stop(true,true).animate({opacity: 0}, 400);
            var time = 400;
            setTimeout(function(){
                time = 0;
            }, 400);
            // alert(window.location.pathname);
            $.ajax({
                url: window.location.pathname,
                global: false,
                type: "GET",
                dataType: "html",
                async: true,
                data: {
                    ajax: 1
                },
                success: function (d) {
                    var time = 0;
                 
                    setTimeout(function () {
                        // if(window.location.pathname.split("/")[2]=="start"){
                        //     $("#menu").css({top: "100%", marginTop: "-130px"});
                        // }
                        $("html,body").scrollTop(0);
                        var code = $(d).find("#content").html();
                        $body.children().not("header, footer").remove();
                        $("header").after(code);
                        $body.children().not("header, footer").css({opacity: 0}).animate({opacity: 1}, 600);
                        Site.onLoad();

                         Site.scrollToArticle(false);
                        // if(window.location.pathname.split("/")[3]){
                        //     if($("[data-path*='/"+window.location.pathname.split("/")[3]+"']").length){
                        //         $window.scrollTop($("[data-path*='/"+window.location.pathname.split("/")[3]+"']").offset().top);
                        //     }
                        // }

                        document.title = $("#title", d).text();
                    }, time);
                    //   document.title = $("#product").find("h2").html().replace("<br />", " ").replace("<br>", " ").replace("amp;","") + " | " + HistoryObj.title;
                },
                error: function () {
                    console.log("error");
                }
            });

            return;
        }
        if(!HistoryObj.noscroll) {
            Site.scrollToArticle();
        } else {
            HistoryObj.noscroll = false;
        }
        if(id == "") {
            $("html,body").stop(true, true).animate({
                scrollTop: 0
            }, 600);
            $("header").find("li").attr("class", "");
            
            if(document.title == ""){
                document.title = HistoryObj.title;
            }
            return;
        }
        if(sub){
            var path = id+"/"+sub;
            if($("[data-path='"+path+"']").length){
                if($("[data-path='"+path+"']").eq(0).find("h1").text() != "")
                document.title = $("[data-path='"+path+"']").eq(0).find("h1").text() + " | " + HistoryObj.title;
            }
        }

        // if($("#" + id).length) {
        //     // if($("#" + id).find("h2").length) document.title = $("#" + id).find("h2").html().replace("<br />", " ").replace("<br>", " ").replace("amp;", "") + " | " + HistoryObj.title;
        //     // $("header").find("li").attr("class", "");
        //     // $("header").find("a[href*='" + id + "']").parent().addClass("active");
        // }
        Site.activeLinks();
    }
};
var Lookbook = {
    interval: null,
    init: function () {
        Lookbook.doUnbind();
        if($("#lookbook").length) {
            var show = new SlideShow("lookbook-slides", {
                aspect: 2 / 3
            });
            $("header").attr("class", "white");
            return;
        }
        if(!$("#lookbooks").length) return;
        $("#lookbooks").find("a.down").on("click", function(e){
            clearInterval(Lookbook.interval);
            e.preventDefault();
            var i = $(e.currentTarget).closest("article").index()-1,
            next = $("#lookbooks").find("article").eq(i+1).offset().top;
            $("html,body").animate({scrollTop: next+"px"},500);
        });
        Lookbook.interval = setInterval(function(){
            $("#lookbooks").find("a.down").eq(0).toggleClass("animate");
        }, 200);
        $("header").attr("class", "white");
        if(Modernizr.backgroundsize && !Modernizr.touch) {
            var imgs = $("#lookbooks").find("article").css({opacity: 0}).children().filter("img"),
            l = imgs.length;
            for(var i = 0; i < l; i++){
                $(imgs[i]).imagesLoaded(function($img){
                    var src = $img.attr("src");
                    $img.parent().css({backgroundImage: "url("+src+")"}).animate({opacity: 1}, 600);
                    $img.remove();
                });
            }
        }
        else {
            Lookbook.onResize();
            $window.bind("resize.lookbook", Lookbook.onResize);
        }
    },
    onState: function(){
        console.log(window.location.path);
    },
    onResize: function () {
        var imgAspect = 7 / 4,
            contentHeight = $window.height(),
            width = $window.width(),
            screenAspect = width / contentHeight,
            _horizontal = imgAspect > screenAspect,
            _leftMargin = (_horizontal) ? -(imgAspect * contentHeight - width) / 2 : "0",
            _imageWidth = (_horizontal) ? "auto" : "100%",
            _imageHeight = (_horizontal) ? "100%" : "auto";
            if(Modernizr.touch && _imageHeight) _imageHeight = contentHeight;
        $("#lookbooks").find("img").css({
            marginLeft: _leftMargin + "px",
            width: _imageWidth,
            height: _imageHeight
        });

    },
    doUnbind: function () {
        $("header").removeClass("white");
        $window.unbind(".lookbook");
        clearInterval(Lookbook.interval);
    }
};
var Map = {
    ST: "",
    distance_var: {"pl": "Odległość", "en": "Distance", "it": "Distanza"}[Site.lang]+":",
    ROOT: "http://"+window.location.host+"/",
    activeWindow: null,
    map: null,
    startCords: Array(52.2306251, 21.0011973),
    defaultZoom: 6,
    points: [],
    mapContainer: "map",
    init: function(){
        if( $("#map").length ){
            $("header").attr("class","text");
            $("#map").height($window.height()-103);
            if($("#map").data("distancevar")){
                Map.distance_var = $("#map").data("distancevar");
            }
            if($("#map").data("st")){
                Map.ST = $("#map").data("st");
            }
            if($("#map").data("root")){
                Map.ROOT = $("#map").data("data-root");
            }
             if(typeof(google) === 'undefined') {
                var cache = $.ajaxSettings.cache;
                $.ajaxSettings.cache = true;
                $.getScript('http://maps.googleapis.com/maps/api/js?sensor=true&callback=Map.onLoad'); 
                $.ajaxSettings.cache = cache;
            }
            else {
                Map.onLoad();
            }
            $("#stores").find("form").on("submit",Map.onSubmit);
        }
    },
    onSubmit: function(e){
        e.preventDefault();
        val = $(e.currentTarget).find("input").val().toLowerCase();
        if($("#store-list").find("[data-city='"+val+"']").length){
            var id = $("#store-list").find("[data-city='"+val+"']").eq(0).data("id"),
            
                m = Map.markers[id],
                cords = [m.position.lat(),m.position.lng()],
           point = new google.maps.LatLng(cords[0], cords[1]);

    //    Map.highlight(id);
        Map.map.setCenter(point);
        // Map.showStore(id);

        Map.map.setZoom(12);
 


            // Map.showStore(id);
            // Map.highlight(id);
        }
        else {
            Map.notify($(e.currentTarget).data("not-found"));
        }
    },
    notify: function(n){
        $('<span class="notification">'+n+'</span>').appendTo("#stores form").hide().fadeIn(400);
        setTimeout(function(){
            $("#stores").find(".notification").fadeOut(400, function(){
                $(this).remove();
            });
        },2000);
    },
    onLoad: function () {

        if($("#" + Map.mapContainer)
            .length) {
      
          
            $.getJSON(Map.ST + '/finder.json', function (data) {
                Map.points = data;
                Map.drawMap();
                Map.mapOptions["mapTypeControlOptions"] = {
                    mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'mapstyle']
                };
                Map.mapOptions["mapTypeId"] = google.maps.MapTypeId.ROADMAP;
                $("#store-list")
                    .find("li")
                    .on("click", Map.viewOnMap);
                $(window)
                    .bind("resize", Map.setCenter);

                Map.geoLocate();
            });
        }
    },
    viewOnMap: function (e) {
        e.preventDefault();
        var id = $(e.currentTarget).data("id"),
        m = Map.markers[id],
                cords = [m.position.lat(),m.position.lng()],
           point = new google.maps.LatLng(cords[0], cords[1]),
           d = ("dist" in m) ? "<br>" + Map.distance_var + " " + m.dist + "km" : "",
            info = new google.maps.InfoWindow({
            content: "<strong>" + m.title + "</strong><br />" + m.c + d
        });


    //    Map.highlight(id);
        Map.map.setCenter(point);
        Map.showStore(id);

        Map.map.setZoom(15);
    },
    showStore: function (id) {
        if(typeof(id) === "undefined") return;
        //if(!Map.ss[id]) return;
        var m = Map.markers[id],
            d = "";
        if(typeof(m)==="undefined") return;
        if("dist" in m) {
            d = "<br />" + Map.distance_var + " " + m.dist + "km";
        }
        var info = new google.maps.InfoWindow({
            content: "<strong>" + m.title + "</strong><br />" + m.c + d
        });
        if(Map.activeWindow != null) Map.activeWindow.close();
        info.open(Map.map, m);
        Map.activeWindow = info;
    },
    highlight: function (id) {
        $("#store-list")
            .find("li.selected")
            .removeClass("selected");
        var store = $("#store-list")
            .find("[data-id='" + id + "']")
            .addClass("selected");
            if(!store) return;
          $("html,body")
            .animate({
            scrollTop: (store.offset().top - $window.height()/2 + store.height()/2) + "px"
        }, 600);
    },
    mapOptions: {
        zoom: 5,
        mapTypeControlOptions: null,
        center: true,
        navigationControl: true,
        scaleControl: false,
        mapTypeControl: false,
        scrollwheel: false,
        draggable: !Modernizr.touch,
        mapTypeId: null
    },
    customStyle: {
        featureType: 'all',
        stylers: [
              { "saturation": -100 },
              { "lightness": 18 },
              { "weight": 0.1 },
              { "gamma": 0.89 }
            ]
    },
    applyMapStyle: function () {
        var customType = new google.maps.StyledMapType([Map.customStyle], {
            name: "mapstyle"
        });
        Map.map.mapTypes.set('mapstyle', customType);
        Map.map.setMapTypeId('mapstyle');
    },
    initClusterMap: function () {},
    markers: Array(),
    drawMap: function () {
        if(document.getElementById(Map.mapContainer)) {
            if(Map.points.length > 0) {
                var gPoints = [];
                for(var i = 0; i < Map.points.length; i++) {
                    gPoints[i] = new google.maps.LatLng(Map.points[i]["m_lat"], Map.points[i]["m_lng"]);
                }
                Map.mapOptions["center"] = gPoints[0];
                Map.map = new google.maps.Map(document.getElementById(Map.mapContainer), Map.mapOptions);
                Map.mc = new MarkerClusterer(Map.map, [], {
                    styles: [{
                        url: Map.ST+'/images/marker.png',
                        height: 33,
                        width: 33,
                        noText: true
                    }],
                    gridSize: 16
                });

                function createMarker(p, t, c, i, id) {
                    var marker = new google.maps.Marker({
                        position: p,
                        title: t,
                        icon: Map.ST+'/images/marker.png',
                        pos: gPoints[i],
                        c: c
                    });
                    var info = new google.maps.InfoWindow({
                        content: "<strong>" + t + "</strong><br />" + c
                    });
                    google.maps.event.addListener(marker, 'click', function () {
                        Map.showStore(id);
                        Map.highlight(id);
                        Map.map.setCenter(gPoints[i]);
                    });
                    Map.mc.addMarker(marker);
                    Map.markers[id] = marker;
                }
                for(var i = 0; i < gPoints.length; i++) {
                    createMarker(gPoints[i], Map.points[i]["m_name"], Map.points[i]["m_address"], i, Map.points[i]["m_id"]);
                }
                //Map.points = null;
                Map.setCenter();
   
                Map.applyMapStyle();
            } else {
                document.getElementById(Map.mapContainer)
                    .style.display = 'none';
            }

        }
        Map.overrideTouch();
    },
    geoLocate: function () {
        if(geo_position_js.init()) {
            geo_position_js.getCurrentPosition(function (p) {
                Map.startCords = [p.coords.latitude, p.coords.longitude];
                Map.defaultZoom = 14;
                Map.findNearest();
                Map.setCenter();
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(p.coords.latitude, p.coords.longitude),
                    title: "Your Location",
                    icon: Map.ST + 'images/you.png'
                });
                Map.mc.addMarker(marker);
            },

            function () {}, {
                enableHighAccuracy: true
            });
        }
    },
    findNearest: function () {
        if(!(Map.points.length > 0)) return;
        var low = 40000,
            lowI = 0;
        $.each(Map.points, function (i, o) {
            var R = 6371,
                pi = Math.PI,
                lat1 = o["m_lat"] * pi / 180,
                lat2 = Map.startCords[0] * pi / 180,
                lon1 = o["m_lng"] * pi / 180,
                lon2 = Map.startCords[1] * pi / 180,
                dif = R * Math.pow(
                Math.pow(lat1 - lat2, 2) + Math.pow((lon1 - lon2) * Math.cos((lat1 + lat2) / 2), 2), 0.5);
            if(dif < low) {
                low = dif;
                lowI = i;
            }
            o["dist"] = Math.round(dif * 10) / 10;
            Map.markers[o["m_id"]]["dist"] = o["dist"];
        });
        Map.startCords = [Map.points[lowI]["m_lat"], Map.points[lowI]["m_lng"]];
        Map.showStore(Map.points[lowI]["m_id"] * 1);
        if($("#city").find("option[value^='" + Map.points[lowI]["m_reg_id"] + ",']").length) {
            $("#city")
            .find("option[value^='" + Map.points[lowI]["m_reg_id"] + ",']")
            .attr("selected", true)
            .closest("select")
            .trigger("change");
        }
    },
    overrideTouch: function () {
        var dragFlag = false,
            start = 0,
            end = 0,
            touchStart = function (e) {
                e = e.originalEvent;
                dragFlag = true;
                start = e.touches[0].pageY;
            },
            touchEnd = function () {
                dragFlag = false;
            },
            touchMove = function (e) {
                e = e.originalEvent;
                if(!dragFlag) { return; }
                end = e.touches[0].pageY;
                window.scrollBy(0, (start - end));
            };
        $("#" + Map.mapContainer).bind({
            "touchstart": touchStart,
            "touchend": touchEnd,
            "touchmove": touchMove
        });
    },
    setCenter: function (e) {
        $("#map").height($window.height()-103);
        var $obj, centerStr;
        if(typeof (e) === "undefined") {
        e = {
            currentTarget: $("#country-gm")
        };
        }
        if($(e.currentTarget).attr("id") == "city") {
            Map.map.setZoom(13);
            $obj = $("#city");
            centerStr = $obj.val().split(",");
        } else if($(e.currentTarget).attr("id") == "country-gm"){
            Map.map.setZoom(5);
            $obj = $("#country-gm");
            centerStr = $obj.val().split(",");
        } else {
            Map.map.setZoom(Map.defaultZoom);
            centerStr = Array("", Map.startCords[0], Map.startCords[1]);
        }
        if(Math.abs(centerStr[1]) > 0 && Math.abs(centerStr[2]) > 0) {
            var centerPoint = new google.maps.LatLng(centerStr[1], centerStr[2]);
            Map.map.setCenter(centerPoint);
        }
    }
};
var Zoom = {
    isZoomed: false,
    touch: [0, 0],
    init: function () {
        Zoom.isZoomed = false;
        $("[data-zoom]").off(".zoominit").on("click.zoominit", Zoom.zoom);
    },
    zoom: function (e) {
        Zoom.isZoomed = true;
        var translations = {
            "pl": "powrót",
            "en": "back",
            "it": "ritorno"
        };
        e.preventDefault();
        $("#zoom").remove();
        e.stopPropagation();
        var img = "<div id=\"zoom\"><img src=\"/images/blank.png\"></div><a id=\"zoom-close\" class=\"close\" href=\"#\">x</a>";
        $("body").append(img);
        if(!Modernizr.touch) {
            $("#zoom")
            //.on('mousemove.zoom', Zoom.zoomupdate)
            //.on("mouseleave.zoom", Zoom.zoomreset)
            .on("click.zoom", Zoom.zoomreset);
        } else {
            $("html,body").animate({
                scrollTop: $("#zoom").offset().top + "px"
            }, 600);
            $("#zoom")
      //      .on("touchmove.zoom", Zoom.onTouchMove).on("touchstart.zoom", Zoom.onTouchStart)
            .on("click.zoom", Zoom.zoomreset);
        }
        $("#zoom-close").text(translations[$("html").attr("lang")]).on("click.zoom", function (e) {
            e.preventDefault();
            Zoom.zoomreset(e)
        });
        $("#zoom").find("img").css({
            opacity: 0
        })
     
        .attr('src', $(e.currentTarget).attr("href"));

        if(Modernizr.csstransitions){
            $("#zoom").find("img").imagesLoaded(function ($img) {
                $img.cssanimate({
                    opacity: 1
                }, 400);
            });
        }
        else {
            $("#zoom").find("img").css({opacity: 1});
        }
        if($(e.currentTarget).data("zoom-class")){
            $("#zoom").addClass($(e.currentTarget).data("zoom-class"));
            $("#zoom-close").addClass($(e.currentTarget).data("zoom-class"));
        }
        // $("#zoom").find(".tooltip").remove();
        Zoom.zoomupdate(e);

    },
    zoomreset: function (e) {
        $(window).scrollTop(0);
        $("#zoom").fadeOut(300, function () {
            $("#zoom").off(".zoom").remove();
        });
        $("#zoom-close").remove();
        Zoom.isZoomed = false;
    },
    onTouchStart: function (je) {
        var e = je.originalEvent;
        Zoom.touch[0] = e.targetTouches[0].pageX;
        Zoom.touch[1] = e.targetTouches[0].pageY;
    },
    onTouchMove: function (je) {
        var e = je.originalEvent,
            pX = e.targetTouches[0].pageX,
            pY = e.targetTouches[0].pageY;
        if(Math.abs(pX - Zoom.touch[0]) > 10 || Math.abs(pY - Zoom.touch[1]) > 10) {
            je.preventDefault();
            je.stopPropagation();
            je.stopImmediatePropagation();
            var $i = $("#zoom").find("img"),
                h = $i.height(),
                w = $i.width(),
                zh = $("#zoom").height(),
                zw = $("#zoom").width(),
                x = (zw - pX + $("#zoom").offset().left) / (zw),
                y = (zh - pY + $("#zoom").offset().top) / (zh);
            $i.css({
                // left: Math.min(0, Math.max(zw - w, (-x * (w - zw)))) + "px",
                top: Math.min(0, Math.max(zh - h, (-y * (h - zh)))) + "px"
            });
        }
    },
    zoomupdate: function (e) {
        var $i = $("#zoom")
        // .height($window.height()-100)
        .find("img"),
            h = $i.height(),
            w = $i.width(),
            zh = $("#zoom").height(),
            zw = $("#zoom").width();
          //  x = (e.pageX - $("#zoom").offset().left) / (zw);
            if(typeof($("#zoom").offset())!=="undefined"){
            var y = (e.pageY - $("#zoom").offset().top) / (zh);
            $i.css({
                //   left: -x * (w - zw) + "px",
                top: -y * (h - zh) + "px"
            });
        }
    }
};
$(Site.init);