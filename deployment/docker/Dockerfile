FROM armdocker.rnd.ericsson.se/proj-eric-oss-drop/k6-base-image:latest

ARG version
ENV TESTWARE_VERSION=$version

ENV STAGING_TYPE="APPLICATION"

ENV APP_NAME="ericsson-core-assurance-test"

# The additional argument to output k6 full result
ENV ADDITIONAL_ARGS=" --out json=/reports/test-output.json "

RUN apk --no-cache add curl

ADD js/ /tests
ADD resources/ /resources
