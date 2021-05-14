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
        }
    },
    methods: {
        handleClick(tab, event) {
            console.log(tab, event);
        },
        queryData() {
            console.log(this.queryConditions)
            axios.get('queryData', {
                params: this.queryConditions
            }).then(res => {
                console.log(res.data)
                this.tableDataOrigin = res['data']['data']
                this.currentPage = 1
                this.tableData = this.tableDataOrigin.slice((this.currentPage - 1) * this.pagesize, this.currentPage * this.pagesize)
            }).catch(e => {

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

            if(response.code === 200) 
                this.$message({
                    message: '上传完成',
                    type: 'success'
                });
        }
    },
    computed: {

    }
})