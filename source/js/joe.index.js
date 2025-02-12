/**首页逻辑 */
const homeContext = {
	/* 初始化轮播图 */
	initSwiper() {
		if (
			ThemeConfig.enable_banner &&
      $(".joe_index__banner .swiper-container").length !== 0
		) {
			new Swiper(".swiper-container", {
				direction: ThemeConfig.banner_direction,
				loop: ThemeConfig.banner_loop,
				keyboard: false,
				mousewheel: false,
				grabCursor: ThemeConfig.enable_banner_handle,
				allowTouchMove: ThemeConfig.enable_banner_handle,
				autoplay: ThemeConfig.enable_banner_autoplay
					? {
						delay: ThemeConfig.banner_delay,
						disableOnInteraction: false,
					}
					: false,
				observer: true,
				pagination: {
					el: ".swiper-pagination",
				},
				navigation: {
					nextEl: ".swiper-button-next",
					prevEl: ".swiper-button-prev",
				},
			});
		}
	},
	/* 初始化首页列表 */
	initList() {
		if (!ThemeConfig.enable_index_list_ajax) return;
		const pageSize = ThemeConfig.post_index_page_size;
		const $el = $(".joe_index__list");
		const $domHeader = $(".joe_header");
		const $navItems = $(".joe_index__title-title .item");
		const $domList = $el.find(".joe_list");
		const $domEmpty = $el.find(".joe_empty");
		const $domLoad = $(".joe_load");
		const $domLoading = $el.find(".joe_list__loading");
		let queryData = {
			page: 0,
			size: pageSize,
			// sort: "createTime,desc", // 默认为创建时间倒叙，置顶优先
		};

		// 初始化Dom
		const initDom = () => {
			$domList.html("").show();
			$domLoad.removeAttr("loading").html("查看更多").show();
			const activeItem = $(
				".joe_index__title-title .item[data-type=\"" + queryData.type + "\"]"
			);
			let activeLine = $(".joe_index__title-title .line");
			activeItem.addClass("active").siblings().removeClass("active");
			activeLine.css({
				left: activeItem.position().left,
				width: activeItem.width(),
			});
		};

		// 获取数据
		const getDate = () => {
			return new Promise((reslove, reject) => {
				$domLoad.attr("loading", true).html("加载中...");
				$domLoading.show();
				Utils.request("/api/content/posts", "GET", queryData)
					.then((res) => {
						const resD = res.content;
						if (resD.length === 0) {
							$domLoad.hide();
							if (queryData.page === 0) {
								$domList.hide();
								$domEmpty.removeClass("hide");
							}
						} else {
							resD.forEach((itm) => $domList.append(getListNode(itm)));
							if (res.isLast) {
								$domLoad.hide();
								// return Qmsg.warning("没有更多内容了");
							}
						}
						$domLoading.hide();
						$domLoad.removeAttr("loading").html("查看更多");
						reslove(resD.length ? resD.length - 1 : 0);
					})
					.catch((err) => {
						if ($(".joe_list__item").length === 0) {
							$domList.hide();
							$domEmpty.removeClass("hide");
						}
						$domLoading.hide();
						$domLoad.removeAttr("loading").html("查看更多");
						reject(err);
					});
			});
		};

		// 渲染Dom节点
		const getListNode = (post) => {
			const thumbnail = post.thumbnail || ThemeConfig.post_thumbnail;
			return `<li class="joe_list__item default animated wow" data-wow-delay="0.2s">
            <div class="line"></div>
            ${
	ThemeConfig.enable_post_thumbnail
		? `<a href="${post.fullPath}" class="thumbnail" title="${
			post.title
		}" target="_blank" rel="noopener noreferrer">
                      <img width="100%" height="100%" class="lazyload" src="${
	ThemeConfig.lazyload_thumbnail
}" data-src="${thumbnail}" onerror="this.src='${
	ThemeConfig.fallback_img
}'" alt="${post.title}">
                      <time datetime="${Utils.formatDate(
		post.createTime
	)}">${Utils.formatDate(post.createTime)}</time>
                      <i class="joe-font joe-icon-picture"></i>
                  </a>`
		: ""
}
            <div class="information">
                <a href="${post.fullPath}" class="title" title="${
	post.title
}" target="_blank" rel="noopener noreferrer">
                  ${
	post.topped
		? "<span class=\"badge\" style=\"display: inline-block\">置顶</span>"
		: ""
}
                  ${post.title}
                </a>
            <a class="abstract" href="${
	post.fullPath
}" title="文章摘要" target="_blank" rel="noopener noreferrer">${
	post.summary
}</a>
            <div class="meta">
                <ul class="items">
                    <li>${Utils.formatDate(post.createTime)}</li>
                    <li>${post.visits || 0} 阅读</li>
                    <li>${post.commentCount || 0} 评论</li>
                    <li>${post.likes || 0} 点赞</li>
                </ul>
                ${
	post.categories.length > 0
		? `<div class="last" style="display: flex">
                  <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="15" height="15"><path d="M512.2 564.743a76.818 76.818 0 0 1-30.973-6.508L108.224 393.877c-26.105-11.508-42.56-35.755-42.927-63.272-.384-27.44 15.356-52.053 41.042-64.232l373.004-176.74c20.591-9.737 45.16-9.755 65.75.017L917.68 266.39c25.668 12.188 41.39 36.792 41.024 64.231-.384 27.5-16.821 51.73-42.908 63.237l-372.57 164.377a77.18 77.18 0 0 1-31.025 6.508zM139.843 329.592l370.213 163.241c1.291.56 3.018.567 4.345-.009l369.758-163.128-369.706-175.464v-.01c-1.326-.628-3.158-.636-4.502 0l-370.108 175.37zm748.015 1.858h.175-.175zM512.376 941.674c-10.348 0-20.8-2.32-30.537-6.997L121.05 778.624c-18.113-7.834-26.454-28.87-18.62-46.983 7.835-18.112 28.862-26.488 46.993-18.61l362.08 156.629 345.26-156.366c17.939-8.166 39.14-.253 47.324 17.746 8.166 17.964.227 39.157-17.729 47.324l-344.51 156.61c-9.196 4.449-19.281 6.7-29.471 6.7z" fill="var(--minor)"></path><path d="M871.563 515.449L511.81 671.775 152.358 515.787v73.578a34.248 34.248 0 0 0 20.76 31.48l301.518 129.19c11.806 5.703 24.499 8.546 37.175 8.546s25.367-2.843 37.174-8.546L850.82 620.534a34.248 34.248 0 0 0 20.744-31.474V515.45z" fill="#ff6a18"></path></svg>
                  <a class="link" target="_blank" rel="noopener noreferrer" href="${post.categories[0].fullPath}">${post.categories[0].name}</a>
              </div>`
		: ""
}
            </div>
        </div>
    </li>`;
		};

		// 切换文章类型
		$navItems.on("click", function () {
			// if ($(this).attr("data-type") === queryData.type) return;
			queryData = {
				page: 0,
				size: pageSize,
				sort: "createTime",
			};
			initDom();
			getDate();
		});

		// 加载更多
		$domLoad.on("click", async function () {
			if ($(this).attr("loading")) return;
			queryData.page++;
			let length = await getDate();
			length = $domList.find(".joe_list__item").length - length;
			const offset =
        $domList.find(`.joe_list__item:nth-child(${length}`).offset().top -
        $domHeader.height();
			window.scrollTo({
				top: offset - 15,
				behavior: "smooth",
			});
		});
		getDate();
	},
	/* 激活列表特效 */
	initListEffect() {
		if (!ThemeConfig.enable_index_list_effect) return;
		new WOW({
			boxClass: "wow",
			animateClass: ThemeConfig.index_list_effect_class || "fadeIn",
			offset: 0,
			mobile: true,
			live: true,
		}).init();
	},
};

!(function () {
	const omits = [];
	document.addEventListener("DOMContentLoaded", function () {
		Object.keys(homeContext).forEach(
			(c) => !omits.includes(c) && homeContext[c]()
		);
	});

	// window.addEventListener("load", function () {
	//   if (omits.length === 1) {
	//     homeContext[omits[0]]();
	//   } else {
	//     omits.forEach((c) => homeContext[c]());
	//   }
	// });
})();
