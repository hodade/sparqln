//最初に実行
window.addEventListener("DOMContentLoaded",function(eve){
	sparqln.load_config();
},false);


(function(){
	"use strict";

	window.sparqln = {

		"current_endpoint_url" : null,
		"current_graph_uri" : null,

		"subject_before":null,
		"subject_index":0,
		"predicate_index":0,

		//コンフィグ読み込み
		"load_config" : function() {
			$.getJSON("./config.jsonx",function(json){
				//Endpointをリスト表示
				$.each(json.endpoints,function(k,v){
					$("#endpoint_list_tmpl").tmpl(v).appendTo("#endpoint_list");
				});
			});
		},

		//グラフ読み込み
		"load_graph" : function(endpoint_url) {
			this.current_endpoint_url = endpoint_url;

			var sparql = "SELECT DISTINCT ?g WHERE { GRAPH ?g { ?s ?p ?o }} ORDER BY ?g";
			endpoint_url = endpoint_url.replace(/<SPARQL>/,decodeURIComponent(sparql));
			
			$("#selected_endpoint").html(endpoint_url);
			$("#graph_list").html('');
			
			$.ajax({
				url:endpoint_url,
				dataType:'json'
			}).done(function(json){
				//グラフをリスト表示
				$.each(json.results.bindings,function(k,v){
					$("#graph_list_tmpl").tmpl({"i":(k+1),"v":v}).appendTo("#graph_list");
				});
			});
		},

		//トリプル画面を開く
		"open_triple_window" : function(graph_uri) {
			window.open("triple.html?endpoint_url="+encodeURIComponent(sparqln.current_endpoint_url)+"&graph_uri="+encodeURIComponent(graph_uri));
		},

		//トリプル読み込み
		"load_triple" : function(graph_uri,offset) {
			this.current_graph_uri = graph_uri;
			var endpoint_url = this.current_endpoint_url;

			$("#selected_graph").html(graph_uri);
			if (!offset) {
				offset = 0;
				sparqln.subject_before = null;
				sparqln.subject_index = 0;
				sparqln.predicate_index = 0;
				$("#triple_list").html('');
			}
			
			var limit = 500;

			var sparql = "SELECT * WHERE { GRAPH <"+graph_uri+"> { ?s ?p ?o }} ORDER BY ?s LIMIT "+limit+" OFFSET "+offset;
			endpoint_url = endpoint_url.replace(/<SPARQL>/,decodeURIComponent(sparql));

			$.ajax({
				url:endpoint_url,
				dataType:'json'
			}).done(function(json){
				// console.log(json);

				$.each(json.results.bindings,function(k,v){
					//subject
					if (sparqln.subject_before != v.s.value) {
						sparqln.subject_index++;
						sparqln.predicate_index = 0;
						$("#triple_list_top_tmpl").tmpl({"i":sparqln.subject_index,"v":v}).appendTo("#triple_list");
					}
					sparqln.subject_before = v.s.value;

					//predicate
					sparqln.predicate_index++;
					$("#triple_list_second_tmpl").tmpl({"i":sparqln.predicate_index,"v":v}).appendTo("#triple_list");

					//moreを追加
					if (json.results.bindings.length-1 == k) {
						$("#triple_list_more_tmpl").tmpl({"g":graph_uri,"offset":offset+limit}).appendTo("#triple_list");
					}
				});
			});
		}

	};

})();


//パラメータを取得する、値はすべて配列で返す
function GetQueryString() {
    var result = {};
    if( 1 < window.location.search.length ){
        // 最初の1文字 (?記号) を除いた文字列を取得する
        var query = window.location.search.substring( 1 );
        // クエリの区切り記号 (&) で文字列を配列に分割する
        var parameters = query.split( '&' );
        for( var i = 0; i < parameters.length; i++ ){
            // パラメータ名とパラメータ値に分割する
            var element = parameters[ i ].split( '=' );
            var paramName = decodeURIComponent( element[ 0 ] );
            var paramValue = decodeURIComponent( element[ 1 ] );
            // パラメータ名をキーとして連想配列に追加する
            if (result[paramName]) {
                result[paramName].push(paramValue);
            } else {
                result[paramName] = [paramValue];
            }
        }
    }
    return result;
}
