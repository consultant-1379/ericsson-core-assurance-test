import json

#Parse full k6 test results to identify the groups with msworkinprogress
#Create a list named groupsWithTag, which includes all the child group names in the k6 full result with msworkinprogress tag
#Please note that we can have only two levels of nested grouping in k6-base-image
groupsWithTag = []
with open('test-output.json') as full_test_results_json_file:
    for resultLine in full_test_results_json_file:
        try:
            resultDict = json.loads(resultLine)
            if  resultDict["data"]["tags"]["testState"]=="msworkinprogress":
                # resultDict["data"]["tags"]["group"] includes the parent and child group name in ::PARENTGROUP::CHILDGROUP format
                # allGroupsName is a list of all group names included in this resultLine (splitted by '::')
                allGroupsName= (resultDict["data"]["tags"]["group"]).split('::')
                # Find the child group name. Later we only add (MS WIP) to the child group
                groupsWithTag.append(allGroupsName[-1])
        except:
            continue

# Add (MS WIP) to the child groups that includes checks with msworkinprogress in result.html
# load the result.html
# groupsWithAddedMSWIP is a list keeping track of the groups with checks that we already added (MS WIP).
# We use groupsWithAddedMSWIP to prevent adding multiple (MS WIP) to the groups.
groupsWithAddedMSWIP=[]
with open(r'result.html','r') as resultFile:
    dataResultFile= resultFile.read()
    print("List of groups with msworkinprogress tag:")
    for groupsWithTagLine in groupsWithTag:
        # check if groupsWithTagLine exists in result.html file data, and if we did not add it to groupsWithAddedMSWIP before
        if(dataResultFile.find(groupsWithTagLine) and not groupsWithTagLine in groupsWithAddedMSWIP):
            print ("    "+groupsWithTagLine)
            dataResultFile= dataResultFile.replace(groupsWithTagLine, groupsWithTagLine+" (MS WIP)")
            groupsWithAddedMSWIP.append(groupsWithTagLine)

print("")
# save result.html again
with open(r'result.html', 'w') as resultFile:
    resultFile.write(dataResultFile)

#Parse summary.json to verify test results
f = open('summary.json',)
data = json.load(f)

# Get the group section. It contains all tests as list items:
# In case of nested groups, another group level might exist in data['root_group']['groups']
groupsection= data['root_group']['groups']

# Check for any failing test and prints decision message
# Message is saved in pipeline as a variable and passed to pod log collection script
# Failed tests will trigger the uS log collection script
fail = False
for i in range(1, 10):
    if(str(groupsection).count("'fails': " + str(i)) != 0):
        fail=True
        print("Log Decision: Fail")
        break
if(not fail):
    print("Log Decision: Pass")

# list of Test groups that should not be evaluated
# a)find item id in group collection where name is in groupsWithTag (list of all the child group names in the k6 full result with msworkinprogress tag)
# b)remove the group from the collection
#
for groupWithTag in groupsWithTag :
    # item is one group in groupsection
    for item in groupsection:
        # if there is no nested group in the current item
        if item["name"] and not item["groups"] and item["name"] == groupWithTag:
            groupsection.remove(item)
        # if there is a second level nested group inside the current item
        elif item["name"] and item["groups"]:
            for childGroup in item["groups"]:
                if childGroup["name"] == groupWithTag:
                    item["groups"].remove(childGroup)
# End list of Test groups that should not be evaluated

# Get the string representation of only the root_group.groups collection
groupstr = json.dumps(groupsection)

# Get only the count of passing as well as failing tests
number_of_passed_tests = groupstr.count('"passes": 1')
number_of_passed_tests= number_of_passed_tests + groupstr.count('"passes": 2')
number_of_passed_tests= number_of_passed_tests + groupstr.count('"passes": 3')
number_of_passed_tests= number_of_passed_tests + groupstr.count('"passes": 4')
number_of_passed_tests= number_of_passed_tests + groupstr.count('"passes": 5')

number_of_failed_tests= groupstr.count('"fails": 1')
#Count fails starting with '2','3','4', etc if they ever happen
number_of_failed_tests= number_of_failed_tests + groupstr.count('"fails": 2')
number_of_failed_tests= number_of_failed_tests + groupstr.count('"fails": 3')
number_of_failed_tests= number_of_failed_tests + groupstr.count('"fails": 4')
number_of_failed_tests= number_of_failed_tests + groupstr.count('"fails": 5')
number_of_failed_tests= number_of_failed_tests + groupstr.count('"fails": 6')
number_of_failed_tests= number_of_failed_tests + groupstr.count('"fails": 7')
number_of_failed_tests= number_of_failed_tests + groupstr.count('"fails": 8')
number_of_failed_tests= number_of_failed_tests + groupstr.count('"fails": 9')

if number_of_failed_tests == 0:
    print("K6 Tests have passed and results are verified.")
    print("Number of tests passed: " + str(number_of_passed_tests))
    print("Number of tests failed: " + str(number_of_failed_tests))
    exit(0)
else:
    print("K6 Tests have failed.")
    print("Number of tests passed: " + str(number_of_passed_tests))
    print("Number of tests failed: " + str(number_of_failed_tests))
    exit(-1)