var server = require('../../utils/server');
Page({
	
	search:function(e){

        var keywords = this.data.keywords;
        wx.navigateTo({
            url: "../../../../goods/list/list?keywords=" + keywords
        });
		//nihao

	},
	bindChange: function(e) {
		
		var keywords = e.detail.value;
		
		this.setData({
			keywords: keywords
		});
	},
	onLoad:function(option)
	{
		var that = this
    
		server.getJSON('/User/getHotKeywords',function(res){
var keyword = res.data.data.hot_keywords;
		    that.setData({keyword:keyword});

		});

		
	},
	click:function(e)
	{
        var keywords = e.currentTarget.dataset.word;
        wx.navigateTo({
            url: "../../../../goods/list/list?keywords=" + keywords
        });
	}
})