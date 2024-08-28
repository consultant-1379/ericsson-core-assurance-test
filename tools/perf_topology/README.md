# Assurance Performance Topology Tool

This script, when used with the topology generator by Sachin K, is designed to handle all of the components needed for generating and loading performance testing data for EBSN topology. Using provided values, it can create scaled topology datasync files as well as create the associated RESTSim templates.

Currently this is supported for EBSN data with a 1:3 ratio for nodes:cells. Once PCC/PCG is updated and ready in RESTSim, the script will be updated accordingly to ease the data replication requirements

Artifacts for LA testing are stored in [Sharepoint](https://ericsson.sharepoint.com/sites/EOOM/Shared%20Documents/Forms/AllItems.aspx?csf=1&web=1&e=747ojw&ovuser=92e84ceb%2Dfbfd%2D47ab%2Dbe52%2D080c6b87953f%2Cryan%2Ea%2Eayotte%40ericsson%2Ecom&OR=Teams%2DHL&CT=1710532062529&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI1MC8yNDAyMDIwNTUxNiIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D&cid=3505c183%2D8487%2D4742%2Dbafb%2D113f4e98a8e8&FolderCTID=0x012000AF5F949A3B4D444998F2276E4957DC71&id=%2Fsites%2FEOOM%2FShared%20Documents%2FGeneral%2FESOA%20Product%20Engineering%2FESOA%202%2E0%20Dimensioning%2FAssurance&viewid=9c0ece30%2D8e9a%2D44ab%2D8e38%2D2e92e37f313c)

Note: A copy of the topology generator is included here that does not have the multiple file support that the latest version does as that has not been working correctly with loading data into CTS yet.

## Usage
The script has multiple functionality options, two of which will handle all of the parts for each of the two components (RESTSim and CTS). All parameters can be specified via flags to the script, run -h to see all options

The first step is to download the DAG files from the above linked sharepoint and copy them to this directory.

### CTS
The script will walk through setting up a config file based on provided slice, cell, and node values and call the topology generator python tool and create a datasync JSON file. Then all of the JSON files (DAGs, and datasync) are copied into the CTS pod (chooses first listed CTS pod from 'kubectl get po' by default)

CTS is then queried for the the Dynamic Attribute Groups (DAGs) and loads them in if they are not already present. Once they are in, the topology datasync file is then loaded in. This can take some time depending on how large the dataset is.

### RESTSim
This directory also contains some base templates for RESTSim data generation with the 1:3 ratio node:cell. For performance in LA, we had the same values used between all template files.

The script will take the base templates, update the timestamps in them, then makes copies based on the number of nodes specified. It will automatically update the node and cell values within the copied files.

These files are then gziped and once all are created, the directory is compressed into a tar.gz.

The template tar can then be copied into the eric-oss-pm-solution-enm-1-0 pod and loaded into the system.

The above linked Sharepoint has some datasync files and template tars that can be used in place of creating new ones, the directory structure will just have to be manually set up - datasync added into this directory, templates added into Templates/test

## References/Links
[Topology Generator by Sachin K](https://eteamspace.internal.ericsson.com/display/SABSS/%5BTopology%5D+Topology+Building+Tool)

[LA Test Artifacts by Nestor M](https://eteamspace.internal.ericsson.com/display/SABSS/ESOA+2.0+LA+-+Test+Artifacts)

[D&D Command References by Paula K and Alan L](https://eteamspace.internal.ericsson.com/pages/viewpage.action?pageId=1837863239)

[ESOA-10948 - AE Spike for LA Data Replication](https://eteamproject.internal.ericsson.com/browse/ESOA-10948)

[Subzero LA Perf Replication Confluence Page by Ryan A](https://eteamspace.internal.ericsson.com/display/SABSS/SA+-+%5BESOA-10948%5D+Perf+LA+Topology+Data+Replication)

[LA Dimensioning Stability Results by Paula K](https://eteamspace.internal.ericsson.com/pages/viewpage.action?pageId=2183665616)