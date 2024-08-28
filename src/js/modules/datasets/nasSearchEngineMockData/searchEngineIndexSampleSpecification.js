const indexBodyWithMapping = {
    "settings": {
     "number_of_shards": 1
    },
    "mappings" : {
      "properties": {
        "full_context":    { "type" : "keyword" },
        "context":     { "type" : "keyword" }
      },
      "dynamic_templates" : [
        {
          "context_template" : {
            "match" : "c_*",
            "mapping" : {
              "type" : "keyword"
            }
          }
        },
        {
          "value_integer_template" : {
            "match" : "vi_*",
            "mapping" : {
              "type" : "integer"
            }
          }
        },
        {
          "value_double_template" : {
            "match" : "vd_*",
            "mapping" : {
              "type" : "double"
            }
          }
        },
        {
          "filter_keyword_template" : {
            "match" : "fk_*",
            "mapping" : {
              "type" : "keyword"
            }
          }
        }
      ]
    }
}
