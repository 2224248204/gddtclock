<template>
	<div class="bmap-page-container">
		<el-amap ref="map" :min-zoom="10" :max-zoom="22" :center="center" :zoom="zoom" @init="initMap" @click="mapClick"
			class="bmap-demo">
			<!-- 操作滚动条 -->
			<el-amap-control-tool-bar></el-amap-control-tool-bar>
			<!-- 旋转控制 -->
			<el-amap-control-control-bar></el-amap-control-control-bar>
			<!-- 地图类型切换 -->
			<el-amap-control-map-type></el-amap-control-map-type>
			<!-- 鹰眼控件 -->
			<!-- <el-amap-control-hawk-eye></el-amap-control-hawk-eye> -->
			<!-- 标注点 -->
			<el-amap-label-marker :position="center" :icon="icon"></el-amap-label-marker>
			<!-- 圆圈 -->
			<!-- <el-amap-circle :center="center" :radius="radius" :editable="editable" :draggable="draggable"></el-amap-circle> -->
			<!-- 搜索 -->
			<!-- <el-amap-search-box @select="selectPoi" :searchOption="searchOption" :onSearchResult="onSearchResult"></el-amap-search-box> -->
			<!-- 测距线 -->
			<el-amap-polyline :editable="polyline.editable" :draggable="polyline.draggable" :path="polyline.path"></el-amap-polyline>
		</el-amap>
		<el-button type="primary" @click="dk">考勤打卡</el-button>
	</div>
</template>

<script>
	export default {
		name: "Index",
		data() {
			return {
				/** 地图参数 开始 */
				zoom: 16,
				center: [113.980028, 23.037871],	// 初始化地图坐标
				map: null,	// 地图
				// 地图标点
				icon: {
					image: "https://a.amap.com/jsapi_demos/static/images/poi-marker.png",
					anchor: "bottom-center",
					size: [25, 34],
					clipOrigin: [459, 92],
					clipSize: [50, 68],
				},
				
				// 圆圈
				editable: false,
				draggable: false,
				radius: 50,
				
				// 插件
				geolocation: null,

				setDistance: 150, // 考勤距离
				distance: 0, // 当前离考勤距离
				
				// 测距线
				polyline: {
					path: [[0,0]],
					events: {
						end: (e) => {
							let newPath = e.target.getPath().map(point => [point.lng, point.lat]);
							console.log(newPath);
						}
					},
					enableEditing: false
				}
				/** 地图参数 结束 */
			}
		},
		methods: {
			/** 地图选址方法 开始 */
			initMap(o) {
				// console.log(o.getCenter())
				// console.log(this.$refs.map.$$getInstance())
				let that = this;

				// 实时定位操作
				AMap.plugin("AMap.Geocoder,AMap.Geolocation,AMap.CircleEditor", function() {
					var geolocation = new AMap.Geolocation({
						enableHighAccuracy: true, //是否使用高精度定位，默认:true
						timeout: 10000, //超过10秒后停止定位，默认：5s
						buttonPosition: "RB", //定位按钮的停靠位置
						buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
						zoomToAccuracy: true, //定位成功后是否自动调整地图视野到定位点
					});
					o.addControl(geolocation);

					let geocoder = new AMap.Geocoder({
						radius: that.radius, //范围，默认：500
					});
					geolocation.getCurrentPosition(function(status, result) {
						if (status == "complete") {
							let lng = result.position.lng;
							let lat = result.position.lat;
							that.center = [lng, lat];

							// 以下初始化地图后就自动获取当前位置并加载到表单
							console.log('当前定位：' + '经度' + lng + ', 纬度' + lat)
							geocoder.getAddress(result.position, function(status, result) {
								if (status === "complete" && result.regeocode) {
									let address = result.regeocode.formattedAddress;
									console.log(address)
								} else {
									console.log("根据经纬度查询地址失败");
								}
							});
							that.onComplete(result)
						} else {
							that.onError(result);
						}
					});
					that.geolocation = geolocation;
					that.map = o;
				});
			},
			mapClick(e) {
				let that = this;
				let lnglat = e.lnglat;
				console.log("经度:" + lnglat.lng);
				console.log("纬度：" + lnglat.lat);

				this.center = [lnglat.lng, lnglat.lat];
				console.log('点击地图：' + '经度' + lnglat.lng + ', 纬度' + lnglat.lat)
				// 逆地理编码
				AMap.plugin("AMap.Geocoder", function() {

					let geocoder = new AMap.Geocoder({
						radius: that.radius, //范围，默认：500
					});

					geocoder.getAddress(lnglat, function(status, result) {
						if (status === "complete" && result.regeocode) {
							var address = result.regeocode.formattedAddress;
							console.log(address)
						} else {
							console.log("根据经纬度查询地址失败");
						}
					});
				});
			},
			/** 搜索 */
			selectPoi(e) {
				console.log("selectPoi: ", e);
				let location = e.poi.location;
				let name = e.poi.name;
				let address = e.poi.address;
				this.center = [location.lng, location.lat];
				console.log("名称：" + name);
				console.log("地址：" + address);
				console.log("位置：" + location);
			},
			onComplete(data) {
				let that = this;
				console.log('定位成功...');
				var str = [];
				str.push('定位结果：' + data.position);
				str.push('定位类别：' + data.location_type);
				if (data.accuracy) {
					str.push('精度：' + data.accuracy + ' 米');
				} //如为IP精确定位结果则没有精度信息
				str.push('是否经过偏移：' + (data.isConverted ? '是' : '否'));


				that.getposition = [data.position.lng, data.position.lat]; //获取当前位置的经纬度

				console.log(that.getposition);

				//这个地方是设置打卡的位置的
				var shanghaizone = [113.979953, 23.037793]; //设置的签到点

				//计算当前位置与考勤点距离
				var distance = AMap.GeometryUtil.distance(that.getposition, shanghaizone).toFixed(0);
				
				var setDistance = that.setDistance; //设定的打卡距离
				
				let j = distance - that.setDistance;
				
				var distancestr = '打卡范围：' + that.setDistance + '米，距离目的地' + distance + '米，距离打卡位置：' + (j < 0 ? 0 : j) + '米';
					
				// 绘制距离线
				that.polyline.path = [
					that.center, shanghaizone
				]
				
				console.log(distancestr);
				that.distance = distance
				if (distance <= setDistance) {
					//在范围内
					console.log('你已进入考勤范围')

				} else {
					//不在范围内
					console.log('未进入考勤范围')
				}

				//绘制签到范围   可以自己去修改 设置活着的数据
				var circle = new AMap.Circle({
					center: shanghaizone,
					radius: that.setDistance, //半径
					borderWeight: 1,
					strokeOpacity: 1,
					strokeOpacity: 0.2,
					fillOpacity: 0.4,
				})

				circle.setMap(that.map)
				// 缩放地图到合适的视野级别
				that.map.setFitView([circle])
				// var circleEditor = new AMap.CircleEditor(that.map, circle)
				// console.log(circleEditor)
			},
			onError(data) {
				console.log(data)
			},
			dk() {
				console.log('打卡操作...')
				console.log(this.setDistance)
				console.log(this.distance)
				alert(this.setDistance + "," + this.distance)
			}
		}
		/** 地图选址方法 结束 */
	}
</script>

<style scoped>
	.bmap-page-container {
		width: 100%;
		height: 600px;
	}
</style>
