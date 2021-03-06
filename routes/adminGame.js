var router = require('express').Router();
var game = require("../DAO/adminGame");
var formidable = require('formidable');
var common = require('../DAO/common');
var PATH = require("../path");
var resource = PATH.resource;
Date.prototype.Format = function (formatStr) {
    var str = formatStr;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    str = str.replace(/yyyy|YYYY/, this.getFullYear());
    str = str.replace(/yy|YY/, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));
    str = str.replace(/MM/, this.getMonth() > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
    str = str.replace(/M/g, this.getMonth());
    str = str.replace(/w|W/g, Week[this.getDay()]);
    str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    str = str.replace(/d|D/g, this.getDate());
    str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
    str = str.replace(/h|H/g, this.getHours());
    str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
    str = str.replace(/m/g, this.getMinutes());
    str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
    str = str.replace(/s|S/g, this.getSeconds());
    return str;
};
router.get('/game', function (req, res, next) {
    admin.getGameByStart(req.query.start, function (result) {
        res.json({game: result[0], cls: result[1]});
    })
});
router.get('/gameAdmin', function (req, res, next) {
    // console.log(req.query.id);
    admin.getGameByStartAdmin(req.query.start, req.query.id, function (result) {
        res.json({game: result[0], cls: result[1]});
    })
});
router.get('/addGameMsg', function (req, res, next) {
    var data = req.query;
    var date = new Date();
    var cls = '0';
    var tag = '0';

    if (data.gameName) {
        game.hasGame(data.gameName, function (result) {
            // console.log(result.length);
            // res.json({state:0,info:"dd"});
            // return false;
            if (!result.length) {
                var gameMsg = {
                    gameName: data.gameName,
                    gameUrlScheme: data.gameUrlScheme || null,
                    gamePackagename: data.gamePackagename || null,
                    gameDownloadIos: data.gameDownloadIos || null,
                    gameRecommend: data.gameRecommend || null,
                    gameVersion: data.gameVersion || null,
                    gameUpdateDate: data.gameUpdateDate || null,
                    gameCompany: data.gameCompany || null,
                    sys: data.sys || null,
                    addTime: date.Format("yyyy-MM-dd") || null,
                    updateDetail: data.addTime || null,
                    gameDetail: data.gameDetail || null,
                    admin: data.admin,
                    type: data.type,
                    cls_ids: data.cls ? data.cls : cls,
                    tag_ids: data.tag ? data.tag : tag
                };
                game.addGameMsg(gameMsg, function (result) {
                    console.log(result.insertId);
                    if (result.insertId) {
                        var cls = data.cls.split(',');
                        console.log(data.cls);
                        for (var i = 0; i < cls.length; i++) {
                            game.addCls(result.insertId, cls[i], function () {

                            })
                        }
                        res.json({state: 1, info: "添加游戏信息成功，请添加游戏图片和安装包"})
                    } else {
                        res.json({state: 0, info: "添加失败"})
                    }
                })
            } else {
                res.json({state: 0, info: "游戏已存在"})
            }
        });
    } else {
        res.json({state: 0, info: "数据错误"})
    }
});


router.get('/gameAdminDetail', function (req, res, next) {
    var id = req.query.id;
    if (!id) {
        res.json({state: 0});
    }
    game.gameMsgInfo(id, function (result) {
        game.gameTag(id, function (data) {
            var arr = {
                "cls": result,
                "tag": data
            }
            res.json(arr);
        })
    })
})


router.post('/SetGameMsg', function (req, res, next) {
    var data = req.body;
    var date = new Date();

    var gameArr = {
        name: data.name || null,//游戏名称
        activation: data.activation || null,//是否上架
        company: data.company || null,//公司
        version: data.version || null,//版本
        download_num: data.download_num || null,//下载数
        sort: data.sort || null,//首页排列
        sort2: data.sort2 || null,//热搜排列
        size: data.size || null,//大小
        id: data.id || null,//id
        up_time: date.Format("yyyy-MM-dd HH:mm") || null,//修改时间
        up_admin: data.up_admin || null//修改者管理员
        // cls_ids: data.cls_ids,//分类id
        // tag_ids: fields.tag_ids//标签id
    };
    // // res.json(game);
    // // return false;
    common.postMsgcheck(gameArr, function (ret_check) {
        if (ret_check.state != 1) {
            res.json({state: 0, info: ret_check.info})
        }
        game.editGameMsg(gameArr, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    })

});
// router.get('setcats', function (req, res, next) {
//     game.gameTagSet("a", function (msg) {
//         res.json(msg);
//     })
// })
router.get('/updateDownloadAndroid', function (req, res, next) {
    if (req.query.id && req.query.url) {
        console.log(req.query);
        game.updateDownloadAndroid(req.query.id, req.query.url, req.query.size, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/addGameImg', function (req, res, next) {
    var data = req.query;
    if (data.id && data.url) {
        game.addGameImg(data.id, data.url, function (result) {
            result.insertId ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/updateGameIcon', function (req, res) {
    var data = req.query;
    if (data.id && data.url) {
        game.updateGameIcon(data.id, data.url, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/updateGameTitleImg', function (req, res) {
    var data = req.query;
    if (data.id && data.url) {
        game.updateGameTitleImg(data.id, data.url, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/deleteGameImg', function (req, res) {
    var data = req.query;
    if (data.id) {
        game.deleteGameImg(data.id, function (result) {
            res.json({state: 1})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/activeSearch', function (req, res, next) {
    var data = "";
    if (req.query) {
        data = req.query;
        game.hasGame(data.name, function (game) {
            common.getGameSearch(data.name, function (result) {
                // console.log(result);
                if (result.length > 0) {
                    res.json({state: 1, result: result});
                } else {
                    res.json({state: 0, result: []});
                }
            })
        })
    } else {
        common.getGameSearch(data, function (result) {
            res.json(result);
        })
    }
});

router.get('/hasGame', function (req, res, next) {
    var data = req.query;
    game.hasGame(data.name, function (game) {
        if (game.length) {
            res.json({state: 1});
        } else {
            res.json({state: 0});
        }
    })
});


router.get('/addGameActive', function (req, res) {
    var data = req.query;
    if (data.game_name && data.type) {
        var active = {
            name: data.name || "",//活动民称
            title: data.title || "",//标题
            sort: data.sort || "",//排序
            active_img: data.active_img || "",//活动图片地址
            active: data.active || "",//1激活;0不激活
            // game_id: data.game_id || "",//游戏id
            type: data.type || "",//推荐位类型
            // sys: data.sys || ""//1:ios   2：andriod
        };

        game.hasGame(data.game_name, function (game) {
            if (game.length) {
                active.game_id = game[0].id
                game.hasActive(data.game_id, data.type, function (result) {
                    if (result.length) {
                        game.deleteActive(data.game_id, data.type, function (result) {
                            if (result.affectedRows) {
                                game.addActive(active, function (result) {
                                    result.insertId ? res.json({state: 1}) : res.json({state: 0})
                                })
                            } else {
                                console.log('2:::' + result);
                                res.json({state: 0})
                            }
                        })
                    } else {
                        game.addActive(active, function (result) {
                            console.log('1:::' + result);
                            result.insertId ? res.json({state: 1}) : res.json({state: 0})
                        })
                    }
                })
            } else {
                res.json({state: 0})
            }
        });
    } else {
        res.json({state: 0})
    }
});
router.get('/setGameActive', function (req, res) {
    var data = req.query;
    if (data.id && data.type) {
        var active = {
            id: data.id,//活动id
            name: data.name || "",//活动民称
            title: data.title || "",//标题
            sort: data.sort || "",//排序
            active_img: data.active_img || "",//活动图片地址
            active: data.active || "",//1激活;0不激活
            game_id: data.game_id || "",//游戏id
            type: data.type || "",//推荐位类型
            // sys: data.sys || ""//1:ios   2：andriod
        };
        game.hasActive(data.game_id, data.type, function (result) {
            if (result.length) {
                game.setActive(active, function (result) {
                    result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
                })
            } else {
                game.addActive(active, function (result) {
                    console.log('1:::' + result);
                    result.insertId ? res.json({state: 1}) : res.json({state: 0})
                })
            }
        });
    } else {
        res.json({state: 0})
    }
});
router.get('/addSubject', function (req, res) {
    var data = req.query;
    if (data.title && data.img) {
        game.addSubject(data.img, data.title, data.detail, data.active, data.sys, function (result) {
            result.insertId ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getSubject', function (req, res) {
    var p = 1;
    var tables = 't_subject';
    var where = " order by id desc ";
    if (req.query.p > 0) {
        p = req.query.p;
    }
    common.page(tables, p, where, "", "", function (result) {
        res.json(result);
    })
    // game.getSubject(function (result) {
    //     res.json({state:1,subject:result})
    // })
});
router.get('/addSubjectGame', function (req, res) {
    var data = req.query;
    if (data.gameId && data.subjectId) {
        game.hasSubjectGame(data.gameId, data.subjectId, function (result) {
            if (!result.length) {
                game.addSubjectGame(data.gameId, data.subjectId, function (result) {
                    result.insertId ? res.json({state: 1}) : res.json({state: 0})
                })
            } else {
                res.json({state: 0})
            }
        });

    } else {
        res.json({state: 0})
    }
});
router.get('/deleteSubjectGame', function (req, res) {
    var data = req.query;
    console.log(data);
    if (data.id) {
        game.deleteSubjectGame(data.id, function (result) {
            console.log(result);
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getSubjectGame', function (req, res) {
    var data = req.query;
    if (data.id) {
        game.getSubjectGame(data.id, function (result) {
            res.json({state: 1, game: result})
        })
    }
});
router.get('/deleteSubject', function (req, res) {
    var data = req.query;
    if (data.subjectId) {
        game.deleteSubject(data.subjectId, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getTag', function (req, res) {
    var p = req.query.p > 0 ? req.query.p : 1;

    var tables = 't_tag';
    var where = " order by id desc ";

    common.page(tables, p, where, "", "", function (result) {
        res.json(result);
    })
    // game.getTag(function (result) {
    //     res.json({state:1,tag:result})
    // })
});
router.get('/getTagByGame', function (req, res) {
    var data = req.query;
    if (data.gameId) {
        // game.getTagByGame(data.gameId, function (result) {
        //     res.json({state: 1, tag: result})
        // })

        game.gameMsgInfo(data.gameId, function (result) {
            game.gameTag(data.gameId, function (data) {
                var arr = {
                    "cls": result,
                    "tag": data
                }
                res.json(arr);
            })

        })
    } else {
        res.json({state: 0})
    }
});
router.get('/setClsAndTag', function (req, res) {
    var data = req.query;
    console.log(data);
    if (data.id) {
        game.setTagAndCls(data.id, data.tag_ids, data.cls_ids, function (result) {
            console.log(result.affectedRows);
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getGameName', function (req, res) {
    var data = req.query;
    if (data.sys && data.msg) {
        game.getGameName(data.sys, data.msg, function (result) {
            res.json({state: 1, name: result})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/deleteTagById', function (req, res) {
    var data = req.query;
    if (data.id) {
        game.deleteTagById(data.id, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/deleteActiveById', function (req, res) {
    var data = req.query;
    // console.log(data);
    if (data.activityId) {
        game.deleteActiveById(data.activityId, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/addTag', function (req, res) {
    var data = req.query;
    if (data.name) {
        game.addTag(decodeURI(data.name), function (result) {
            result.insertId ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/editTag', function (req, res) {
    var data = req.query;
    if (data.tagId && data.name) {
        game.editTag(data.tagId, decodeURI(data.name), function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/upTag', function (req, res) {
    var data = req.query;
    if (data.tagId && data.active) {
        game.upTag(data.tagId, parseInt(data.active) ? 0 : 1, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
module.exports = router;
