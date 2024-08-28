########################################  restsim RAN dataset  ########################################
This suite contains ran Pm Counter data
This suite contains all ran kpi data added in 3 flow files as per the EBSN Avro Schemas
kpi information - https://eteamspace.internal.ericsson.com/pages/viewpage.action?spaceKey=AAP&title=KPI+Calculations+Supported

# Port forward the pm solution enm pod to upload the data through restsim
$ kubectl port-forward svc/eric-oss-pm-solution-enm-1 -n alpha 4545:4545
Forwarding from 127.0.0.1:4545 -> 4545

# curl command to uploading flow files to Rest Sim 
$ curl -X PUT -T NB_EBSN_REPLAY.tar.gz localhost:4545
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2537    0    27  100  2510     24   2271  0:00:01  0:00:01 --:--:--  2298File uploaded successfully


Note :- Only .gz file can be uploaded

# Example for converting compressed flow files to .gz extension
$ tar -zcvf NB_EBSN_REPLAY.tar.gz final-ran-data-new/
final-ran-data-new/
final-ran-data-new/A20240303.1015+0000-1030+0000_SubNetwork=RAN,MeContext=NR99gNodeBRadio96Mac02,ManagedElement=NR99gNodeBRadio96Mac02_osscounterfile_DU_1.xml.gz
final-ran-data-new/A20240303.1015+0000-1030+0000_SubNetwork=RAN,MeContext=NR99gNodeBRadio96Mac02,ManagedElement=NR99gNodeBRadio96Mac02_osscounterfile_DU_2.xml.gz
final-ran-data-new/A20240303.1015+0000-1030+0000_SubNetwork=RAN,MeContext=NR99gNodeBRadio96Mac02,ManagedElement=NR99gNodeBRadio96Mac02_osscounterfile_DU_3.xml.gz


########################################  restsim Core dataset  ########################################
This suite contains the core Pm Counter data
This suite contains all core kpi data added in 80 flow files as per the Core Avro Schemas
kpi information - https://eteamspace.internal.ericsson.com/pages/viewpage.action?spaceKey=AAP&title=KPI+Calculations+Supported

For core tar file, it must be in the exact folder structure and filename convention. Each pcc and pcg files should have 16 templates per managedElement
Folder structure example:
  PCC_AMF
  PCC_SMF
  PCG_UPF

# Example for converting compressed flow files to .gz extension
gzip A20240329.0000+0000-0015+0000_SubNetwork=5GCore,ManagedElement=PCG00032_statsfile_template1.xml
A20240329.0000+0000-0015+0000_SubNetwork=5GCore,ManagedElement=PCG00032_statsfile_template1.xml.gz

tar -czvf pcc_pcg_templates.tar.gz pcc_pcg_templates

# Port forward the pm solution enm pod to upload the data through restsim
kubectl port-forward svc/eric-oss-pm-solution-enm-1 -n <namespace> 4545:4545
Forwarding from 127.0.0.1:4545 -> 4545

# curl command to uploading flow files to RESTSim
curl -X PUT -T pcc_pcg_templates.tar.gz localhost:4545
INFO : File uploaded successfully





