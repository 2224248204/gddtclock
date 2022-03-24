<template>
	<div class="bmap-page-container">
		<!-- 地图 -->
		<el-amap ref="map" :min-zoom="10" :max-zoom="22" :center="center" :zoom="zoom" @init="initMap">
			<!-- 自身定位标注点 -->
			<el-amap-label-marker :position="center" :icon="icon"></el-amap-label-marker>
		</el-amap>

		<button :class="{'doClock': true, 'doClockOn' : clock.user.isClock}" @click="doClock"
			v-html="clock.user.isClock ? '打卡' : '未进入范围'"></button>

		<div class="block" style="text-align: left;">
			<el-timeline :reverse="reverse">
				<el-timeline-item v-for="(activity, index) in activities" :key="index" :timestamp="activity.timestamp">
					{{activity.content}}
				</el-timeline-item>
			</el-timeline>
		</div>


	</div>
</template>

<script>
	export default {
		name: 'Index2',
		data() {
			return {
				/** 地图参数 */
				map: null, // 地图
				center: [113.980028, 23.037871], // 默认定位到地图坐标
				zoom: 16, // 地图默认缩放
				radius: 50, // 默认半径

				/** 地图标注图标 */
				icon: {
					image: "https://a.amap.com/jsapi_demos/static/images/poi-marker.png",
					anchor: "bottom-center",
					size: [25, 34],
					clipOrigin: [459, 92],
					clipSize: [50, 68],
				},

				/** 打卡参数 */
				clock: {
					center: [113.980028, 23.037871], // 默认打卡坐标
					range: 80, // 打卡范围，单位：米,
					// 是否显示当前位置与考勤位置距离线
					polyline: {
						show: true
					},
					// 用户打卡参数
					user: {
						isClock: false, // 是否进入打卡范围
						address: '', // 打卡地点
					}
				},

				/** 信息显示参数 */
				reverse: false,
				activities: []
			}
		},
		methods: {
			/** 初始化地图 */
			async initMap(o) {
				console.log('初始化地图信息...')
				let _that = this
				
				_that.map = o
				_that.setActivities('初始化地图信息...')
				
				// 调用获取当前位置信息
				let currentPosition = await _that.getCurrentPosition()

				// 更新当前定位信息坐标到地图
				let currentLng = currentPosition.position.lng
				let currentLat = currentPosition.position.lat
				let lnglat = [currentLng, currentLat]
				_that.center = lnglat
				console.log('当前位置：' + lnglat)
				_that.setActivities('当前位置：' + lnglat)
				
				// 设置圈圈
				let currentCirecle = new AMap.Circle({
					center: lnglat,
					radius: _that.radius,
					borderWeight: 1,
					strokeOpacity: 1,
					strokeOpacity: 0.2,
					fillOpacity: 0.4,
				})
				currentCirecle.setMap(o)
				// _that.map.setFitView([currentCirecle])

				// 获取当前地址信息
				let currentAddress = await _that.getCurrentAddress(lnglat)
				_that.clock.user.address = currentAddress.formattedAddress
				console.log('当前地址：' + currentAddress.formattedAddress)
				_that.setActivities('当前地址：' + currentAddress.formattedAddress)

				// 调用初始化打卡信息
				_that.initClock(currentPosition)
			},
			/** 获取当前位置信息 */
			getCurrentPosition() {
				let _that = this
				let data = null
				return new Promise(function(resolve, reject) {
					AMap.plugin('AMap.Geolocation', function() {
						let geolocation = new AMap.Geolocation({
							enableHighAccuracy: true, //是否使用高精度定位，默认:true
							timeout: 10000, //超过10秒后停止定位，默认：5s
							buttonPosition: "RB", //定位按钮的停靠位置
							buttonOffset: new AMap.Pixel(10,
							20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
							zoomToAccuracy: true, //定位成功后是否自动调整地图视野到定位点
						});

						geolocation.getCurrentPosition(function(status, result) {
							if (status == 'complete') {
								data = result
								resolve(data)
							} else {
								reject('获取当前位置信息失败...')
							}
						})
					})
				}).then((res) => {
					console.log('定位成功...')
					console.log(res)
					_that.setActivities('定位成功...')
					_that.setActivities(res)

					// 定位信息
					let str = [];
					str.push('定位结果：' + res.position);
					str.push('定位类别：' + res.location_type);
					if (res.accuracy) {
						str.push('精度：' + res.accuracy + ' 米');
					}
					//如为IP精确定位结果则没有精度信息
					str.push('是否经过偏移：' + (res.isConverted ? '是' : '否'));
					
					console.log(str)
					_that.setActivities(str)
					return res
				}).catch((error) => {
					console.log(error)
					_that.setActivities(error)
				})
			},
			/** 逆地理，坐标转换地理位置信息 */
			getCurrentAddress(lnglat) {
				let _that = this
				let address = ''
				return new Promise(function(resolve, reject) {
					AMap.plugin('AMap.Geocoder', function() {
						let geocoder = new AMap.Geocoder({})
						geocoder.getAddress(lnglat, function(status, result) {
							if (status == 'complete' && result.regeocode) {
								address = result.regeocode
								resolve(address)
							} else {
								reject('获取位置信息失败...')
							}
						})
					})
				}).then((res) => {
					console.log('位置信息获取成功...')
					console.log(res)
					_that.setActivities('位置信息获取成功...')
					_that.setActivities(res)
					return res
				}).catch((error) => {
					console.log(error)
					_that.setActivities(error)
				})
			},

			/** 初始化打卡 */
			initClock(data) {
				let _that = this
				console.log('初始化打卡信息...')
				console.log('打卡位置：' + _that.clock.center)
				console.log('打卡范围：' + _that.clock.range + '米')
				_that.setActivities('初始化打卡信息...')
				_that.setActivities('打卡位置：' + _that.clock.center)
				_that.setActivities('打卡范围：' + _that.clock.range + '米')

				// 创建当前位置距离打卡地点的线
				if (_that.clock.polyline) {
					let polyline = new AMap.Polyline({
						path: [_that.center, _that.clock.center]
					})
					polyline.setMap(_that.map)
				}

				// 设置打卡地点圈圈
				let clockCirecle = new AMap.Circle({
					center: _that.clock.center,
					radius: _that.clock.range,
					borderWeight: 1,
					strokeOpacity: 1,
					strokeOpacity: 0.2,
					fillOpacity: 0.4,
				})
				clockCirecle.setMap(_that.map)
				// _that.map.setFitView([clockCirecle])	// 缩放地图到合适的打卡地点视野

				// 当前位置距离打卡地点的位置
				let distance = AMap.GeometryUtil.distance(_that.center, _that.clock.center).toFixed(0)
				console.log('距离打卡位置：' + distance + '米')
				_that.setActivities('距离打卡位置：' + distance + '米')

				// 距离可打卡范围
				let inDistance = distance - _that.clock.range
				console.log('还剩' + (inDistance <= 0 ? inDistance : inDistance) + '米进入打卡范围')
				_that.setActivities('还剩' + (inDistance <= 0 ? inDistance : inDistance) + '米进入打卡范围')

				// 计算是否已进入打卡范围
				let isClock = inDistance <= 0 ? true : false
				_that.clock.user.isClock = isClock
				console.log('是否进入打卡范围：' + isClock)
				_that.setActivities('是否进入打卡范围：' + isClock)

			},
			/** 打卡事件 */
			doClock() {
				if (this.clock.user.isClock) {
					console.log('打卡成功！')
					console.log('打卡地点：' + this.clock.user.address)
					this.setActivities('打卡成功！')
					this.setActivities('打卡地点：' + this.clock.user.address)
				}
			},
			setActivities(content) {
				let activitie = {
					content: content,
					timestamp: new Date()
				}
				this.activities.push(activitie)
			}
			
		}
	}
</script>

<style scoped>
	.bmap-page-container {
		height: 500px;
	}

	.doClock {
		border: none;
		outline: none;
		width: 150px;
		height: 150px;
		border-radius: 50%;
		font-size: 24px;
		margin-top: 15px;
		transition: opacity .3;
		color: #999;
		border: 1px solid #eee;
	}

	.doClockOn {
		color: #fff;
		border: 1px solid aqua;
		background-color: #70E1F7;
		box-shadow: 0 0 10px rgba(0, 0, 0, .3);
	}

	.doClockOn:hover {
		cursor: pointer;
		opacity: .9;
	}
</style>
