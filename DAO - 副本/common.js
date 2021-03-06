var query = require('../config/config');
var crypto = require('crypto');

var page = require("../DAO/page")


var common = {
    /**
     * md5加密
     * @param pwd
     * @returns {PromiseLike<ArrayBuffer>}
     */
    pwdMd5: function (pwd) {
        var md5 = crypto.createHash('md5');
        //var result =
        var pwd = md5.update(pwd).digest('hex')
        return pwd;
        //return callback(result)
    },

    /**
     * 分页page
     * @param tables 表名
     * @param p 当前页
     * @param where
     * @param sqlType
     * @param field 查找的字段
     * @param callback
     */
    page: function (tables, p, where = "", sqlType = "", field = "", callback) {
        var pageCount = 0;
        var sizeCount = 0;
        var p_num = 10;
        var lastPage = "";
        var firstPage = "";
        var arr = {};
        // var p = 1;
        var nextPage = 2;
        var prevPage = 1;
        var max_page = 10;
        var min_page = 1;
        // var pa = parseFloat(req.query.pa);

        if (p > 0) {
            nextPage = p + 1;
            prevPage = p - 1;
            if (p <= 1) {
                prevPage = 1;
                firstPage = 1
            }
        } else {
            firstPage = 1
        }

        if (p > 10) {
            min_page = p;
            max_page = p + 9;
        }
        page.getPage(tables, p, p_num, where, sqlType, field, function (result) {
            sizeCount = result.count;
            if (sizeCount > 0) {
                pageCount = sizeCount % p_num == 0 ? sizeCount / p_num : sizeCount / p_num + 1;
                pageCount = parseInt(pageCount);
                if (pageCount < p) {
                    p = pageCount;
                    prevPage = pageCount - 1;
                }
                if (result.lists.length < p_num) {
                    lastPage = 1;
                }
                if (pageCount < max_page) {//TODO：暂定
                    max_page = pageCount;
                }
                arr = {
                    result: result.lists,
                    nowPage: p,
                    firstPage: firstPage,
                    lastPage: lastPage,
                    nextPage: nextPage,
                    prevPage: prevPage,
                    totalPage: pageCount,
                    // page_num: page_num,
                    min_page: min_page,
                    max_page: max_page
                };
                // res.json(arr);
                return callback(arr);
            }
        });
    },

    postMsgcheck: function (post, callback) {
        var info = ""
        var msg = {state: 1};
        for (var i in post) {
            if (!post[i]) {
                info = "提交参数不能为空";
                msg = {state: 0, info: info}
                break;
            }
        }
        return callback(msg);
    },

    getGameSearch: function (obj = "", callback) {
        var sql = "SELECT * FROM t_game LIMIT 0,30";
        if (obj) {
            sql = "SELECT * FROM t_game WHERE game_name LIKE '%" + obj + "%' LIMIT 0,30";
        }
        query(sql, [], function (result) {
            return callback(result);
        })
    },
}

module.exports = common;
