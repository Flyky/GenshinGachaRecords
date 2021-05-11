new Vue({
    el: "#app",
    data() {
        return {
            activeName: 'first',
            tableData: [],
            queryConditions: {
                timeDesc: true,
                gacha_type: null,
                gacha_timeRange: null,
                item_type: null,
            },
            optionsGachaType: [
                { value: 1, label: '角色池' }, { value: 2, label: '武器池' },
                { value: 3, label: '常驻池' }, { value: 0, label: '新手池' },
            ],
            optionsItemType: [
                { value: 1, label: '角色' }, { value: 2, label: '武器' },
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
            }
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
                this.tableData = res['data']['data']
            }).catch(e => {

            })
        }
    }
})