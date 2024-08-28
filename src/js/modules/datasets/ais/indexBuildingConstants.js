export const pmStatsMockKeySchema = `{
    "name": "KeySchema",
    "type": "record",
    "fields": [
      {
        "name": "schema",
        "type": "string"
      }
    ]
  }`;
  
export const pmStatsMockValueSchema = `{
  "type": "record",
  "name": "schema",
  "namespace": "kpi_simple_ssnssai_15",
  "fields": [
    {
      "name": "SNSSAI",
      "type": "string"
    },
    {
      "name": "NF",
      "type": "string"
    },
    {
      "name": "Collection",
      "type": "string"
    },
    {
      "name": "csac_0fcf6508_67cc_4969_1f2f_566c106e38b0",
      "type": "long"
    },
    {
      "name": "csac_9a6ec349_5637_4c92_8bfd_a55630f442d5",
      "type": "double"
    },
    {
      "name": "aggregation_begin_time",
      "type": "long"
    },
    {
      "name": "aggregation_end_time",
      "type": "long"
    }
  ]
}`;

export const soaNfNsiValueSchema = `{
  "type": "record",
  "name": "nfnsischema",
  "namespace": "soa.nf.nsi",
  "fields": [
    {
      "name": "NF",
      "type": "string"
    },
    {
      "name": "NSI",
      "type": "string"
    },
    {
      "name": "csac_0fcf6508_67cc_4969_1f2f_566c106e38b0",
      "type": "long"
    },
    {
      "name": "csac_9a6ec349_5637_4c92_8bfd_a55630f442d5",
      "type": "long"
    },
    {
      "name": "aggregation_begin_time",
      "type": "string"
    },
    {
      "name": "aggregation_end_time",
      "type": "string"
    }
  ]
}`;

export const soaNfValueSchema = `{
  "type": "record",
  "name": "nfschema",
  "namespace": "soa.nf",
  "fields": [
    {
      "name": "NF",
      "type": "string"
    },
    {
      "name": "csac_0fcf6508_67cc_4969_1f2f_566c106e38b0",
      "type": "long"
    },
    {
      "name": "csac_9a6ec349_5637_4c92_8bfd_a55630f442d5",
      "type": "long"
    },
    {
      "name": "aggregation_begin_time",
      "type": "string"
    },
    {
      "name": "aggregation_end_time",
      "type": "string"
    }
  ]
}`;

export const soaNsiValueSchema = `{
  "type": "record",
  "name": "nsischema",
  "namespace": "soa.nsi",
  "fields": [
    {
      "name": "NSI",
      "type": "string"
    },
    {
      "name": "csac_0fcf6508_67cc_4969_1f2f_566c106e38b0",
      "type": "long"
    },
    {
      "name": "csac_9a6ec349_5637_4c92_8bfd_a55630f442d5",
      "type": "long"
    },
    {
      "name": "aggregation_begin_time",
      "type": "string"
    },
    {
      "name": "aggregation_end_time",
      "type": "string"
    }
  ]
}`;