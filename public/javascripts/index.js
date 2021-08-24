//axios请求拦截器
axios.interceptors.request.use(config => {
	if (/get/i.test(config.method)) { //判断get请求
		config.params  =  config.params || {};
		config.params.t = Date.parse(new Date())/1000; //添加时间戳
	}
    return config;
}, error => {
    return Promise.reject(error);
})

new Vue({
    el: "#app",
    data() {
        return {
            activeName: 'first',
            tableData: [],
            tableDataOrigin: [],
            // dataTotal: 0,
            pagesize: 20,
            currentPage: 1,
            queryConditions: {
                timeDesc: true,
                gacha_type: null,
                gacha_timeRange: null,
                item_type: null,
                rank: null,
            },
            optionsGachaType: [
                { value: 1, label: '角色池' }, { value: 2, label: '武器池' },
                { value: 3, label: '常驻池' }, { value: 0, label: '新手池' },
            ],
            optionsItemType: [
                { value: 1, label: '角色' }, { value: 2, label: '武器' },
            ],
            optionsRank: [
                { value: 5, label: '⭐⭐⭐⭐⭐' }, { value: 4, label: '⭐⭐⭐⭐' }, { value: 3, label: '⭐⭐⭐' },
            ],
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, 
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }, 
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }
                ]
            },
            uploadPwd: {pwd:null},
            tableColumnViewsCheck: [],
            tableColumnViews: {
                'guaranteed': false,
                'total': false,
            },
            groupAnaySwitch: true,
            tableGroupAnayCha5: [],
            tableGroupAnayCha4: [],
            tableGroupAnayArm5: [],
            tableGroupAnayArm4: [],
            tableGroupAnayArm3: [],

            queryOnHeatmap: {
                year: null, gacha_type: null 
            },
            optionsYears: [],
            loadings:{
                mainTable: false
            },

        }
    },
    methods: {
        handleClick(tab, event) {
            console.log(tab, event);
            if(tab['name'] === 'third') {
                this.queryDataAnalysis()
                this.analysisYearMonthData()
                this.analysisDailyData()
            }
        },
        queryData() {
            this.loadings.mainTable = true
            axios.get('queryData', {
                params: this.queryConditions
            }).then(res => {
                this.tableDataOrigin = res['data']['data']
                this.currentPage = 1
                this.tableData = this.tableDataOrigin.slice((this.currentPage - 1) * this.pagesize, this.currentPage * this.pagesize)
                this.loadings.mainTable = false
            }).catch(e => {
                this.loadings.mainTable = false
            })
        },
        handleSizeChange(size) {
            this.pagesize = size;
            this.tableData = this.tableDataOrigin.slice((this.currentPage - 1) * this.pagesize, this.currentPage * this.pagesize)
        },
        handleCurrentChange(currentPage) {
            this.currentPage = currentPage;
            this.tableData = this.tableDataOrigin.slice((this.currentPage - 1) * this.pagesize, this.currentPage * this.pagesize)
        },

        rankNumToStars(n) {
            if(n === 3) return '⭐⭐⭐'
            if(n === 4) return '⭐⭐⭐⭐'
            if(n === 5) return '⭐⭐⭐⭐⭐'
            return n
        },
        gachaTypeNumToStrings(n) {
            if(n === 0) return '新手池'
            if(n === 1) return '角色池'
            if(n === 2) return '武器池'
            if(n === 3) return '常驻池'
            return n
        },
        itemTypeToTableColor({row, column, rowIndex, columnIndex}) {
            if (row.item_type===1 && columnIndex === 1) {
                return 'color: #007a99'
            } 
            if(row.item_type===2 && columnIndex === 1) {
                return 'color: #ff751a'
            }
        },
        afterUploadData(response, file, fileList) {
            if(response.code === 500) 
                this.$message.error(response.msg);

            if(response.code === 200) {
                let records = response.records
                let message = `上传完成，共插入${records.reduce((x,y)=>x+y)}条数据<br>`
                message += records[1] ? `角色池：${records[1]}条; `: ''
                message += records[2] ? `武器池：${records[2]}条; `: ''
                message += records[3] ? `常驻池：${records[3]}条; `: ''
                message += records[0] ? `新手池：${records[0]}条; `: ''
                this.$message({
                    dangerouslyUseHTMLString: true,
                    message: message,
                    type: 'success'
                });
            }
                
        },

        reLayoutTable() {
            this.$nextTick(() => {
                this.$refs.tableMain.doLayout()
            })
        },

        queryDataAnalysis() {
            axios.get('queryData/AnaGroupCount')
            .then(res => {
                // console.log(res.data)
                this.tableGroupAnayCha5 = res['data']['data'][0]
                this.tableGroupAnayCha4 = res['data']['data'][1]
                this.tableGroupAnayArm5 = res['data']['data'][2]
                this.tableGroupAnayArm4 = res['data']['data'][3]
                this.tableGroupAnayArm3 = res['data']['data'][4]
            }).catch(e => {

            })
        },
        analysisYearMonthData() {
            // console.log(123)
            axios.get('queryData/AnaYearMonth')
            .then(res => {
                let axisData = res.data.data.xAxisData
                let series = res.data.data.series
                var chartAnaYearMonth = echarts.init(document.getElementById('ana-year-month'))
                var chartAnaYearMonthOption = {
                    title: {
                        text: '年月分组数据统计图'
                    },
                    dataZoom: [
                        {   // 这个dataZoom组件，默认控制x轴。
                            type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
                            start: 0,      // 左边在 10% 的位置。
                            end: 100         // 右边在 60% 的位置。
                        }
                    ],
                    grid: {
                        top: '12%', left: '3%',
                        right: '3%', bottom: '12%', containLabel: true
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data:['Total', '五星', '常驻池', '角色UP池', '武器池'],
                        right: 5
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: axisData
                    },
                    yAxis: {},
                    series: series
                }
                chartAnaYearMonth.setOption(chartAnaYearMonthOption)
                window.addEventListener('resize', function() {
                    chartAnaYearMonth.resize();
                })
            }).catch(e => {

            })
        },

        analysisDailyData() {
            const _this = this
            axios.get('queryData/AnaDailyHeatmap',{
                params: _this.queryOnHeatmap
            })
            .then(res => {
                var chartAnaDailyHeatmap = echarts.init(document.getElementById('dailyHeatmap'))
                let result = res.data.data
                let max = 0
                result.forEach(e => max = e[1] > max? e[1]: max)
                max = Math.ceil(max / 10) * 10
                let heatmapOption = {
                    tooltip: {
                        borderWidth: 3,
                        extraCssText: 'box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);',
                        formatter: function (p) {
                            return `[${p.data[0]}] ${p.data[1]}次`
                        }
                    },
                    visualMap: {
                        min: 0,
                        max: max,
                        range: [0, max],
                        calculable: true,
                        orient: 'horizontal',
                        left: 'center',
                        top: 1
                    },
                    calendar: {
                        top: 70,
                        left: 30,
                        right: 30,
                        cellSize: ['auto', 13],
                        range: _this.queryOnHeatmap.year,
                        itemStyle: {
                            borderWidth: 0.5
                        },
                        yearLabel: {show: false}
                    },
                    series: {
                        type: 'heatmap',
                        coordinateSystem: 'calendar',
                        data: result
                    }
                }
                chartAnaDailyHeatmap.setOption(heatmapOption)
                window.addEventListener('resize', function() {
                    chartAnaDailyHeatmap.resize();
                })
            }).catch(e => {

            })
        },

    },
    computed: {

    },
    watch: {
        tableColumnViewsCheck(val) {
            this.tableColumnViews['total'] = val.includes('total') ? true: false
            this.tableColumnViews['guaranteed'] = val.includes('guaranteed') ? true: false
            this.$nextTick(() => {
                this.$refs.tableMain.doLayout();
              });
        }
    },
    mounted() {
        // 初始化热力图年份选择列表
        let nowYear = new Date().getFullYear()
        this.queryOnHeatmap.year = ''+nowYear
        for (let index = nowYear; index >= 2020; index--) {
            this.optionsYears.push({
                value: ''+index,
                label: index
            })
        }

    }
})