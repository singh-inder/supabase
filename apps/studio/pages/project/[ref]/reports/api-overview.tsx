import ReportFilterBar from 'components/interfaces/Reports/ReportFilterBar'
import ReportHeader from 'components/interfaces/Reports/ReportHeader'
import ReportPadding from 'components/interfaces/Reports/ReportPadding'
import ReportWidget from 'components/interfaces/Reports/ReportWidget'
import { createFilteredDatePickerHelpers } from 'components/interfaces/Reports/Reports.constants'
import {
  ErrorCountsChartRenderer,
  NetworkTrafficRenderer,
  ResponseSpeedChartRenderer,
  TopApiRoutesRenderer,
  TotalRequestsChartRenderer,
} from 'components/interfaces/Reports/renderers/ApiRenderers'
import type { DatePickerToFrom } from 'components/interfaces/Settings/Logs/Logs.types'
import DefaultLayout from 'components/layouts/DefaultLayout'
import ReportsLayout from 'components/layouts/ReportsLayout/ReportsLayout'
import ShimmerLine from 'components/ui/ShimmerLine'
import { useApiReport } from 'data/reports/api-report-query'
import { useSelectedOrganization } from 'hooks/misc/useSelectedOrganization'
import { NextPageWithLayout } from 'types'

export const ApiReport: NextPageWithLayout = () => {
  const report = useApiReport()
  const organization = useSelectedOrganization()

  const {
    data,
    error,
    filters,
    isLoading,
    params,
    mergeParams,
    removeFilters,
    addFilter,
    refresh,
  } = report

  const plan = organization?.plan

  const handleDatepickerChange = ({ from, to }: DatePickerToFrom) => {
    mergeParams({
      iso_timestamp_start: from || '',
      iso_timestamp_end: to || '',
    })
  }

  return (
    <ReportPadding>
      <ReportHeader title="API Gateway" showDatabaseSelector={false} />
      <div className="w-full flex flex-col gap-1">
        <ReportFilterBar
          onRemoveFilters={removeFilters}
          onDatepickerChange={handleDatepickerChange}
          datepickerFrom={params.totalRequests.iso_timestamp_start}
          datepickerTo={params.totalRequests.iso_timestamp_end}
          onAddFilter={addFilter}
          onRefresh={refresh}
          isLoading={isLoading}
          filters={filters}
          datepickerHelpers={createFilteredDatePickerHelpers(plan?.id || 'free')}
          showDatabaseSelector={false}
        />
        <div className="h-2 w-full">
          <ShimmerLine active={isLoading} />
        </div>
      </div>

      <ReportWidget
        isLoading={isLoading}
        params={params.totalRequests}
        title="Total Requests"
        data={data.totalRequests || []}
        error={error.totalRequest}
        renderer={TotalRequestsChartRenderer}
        append={TopApiRoutesRenderer}
        appendProps={{ data: data.topRoutes || [], params: params.topRoutes }}
      />
      <ReportWidget
        isLoading={isLoading}
        params={params.errorCounts}
        title="Response Errors"
        tooltip="Error responses with 4XX or 5XX status codes"
        data={data.errorCounts || []}
        error={error.errorCounts}
        renderer={ErrorCountsChartRenderer}
        appendProps={{
          data: data.topErrorRoutes || [],
          params: params.topErrorRoutes,
        }}
        append={TopApiRoutesRenderer}
      />
      <ReportWidget
        isLoading={isLoading}
        params={params.responseSpeed}
        title="Response Speed"
        tooltip="Average response speed of a request (in ms)"
        data={data.responseSpeed || []}
        error={error.responseSpeed}
        renderer={ResponseSpeedChartRenderer}
        appendProps={{ data: data.topSlowRoutes || [], params: params.topSlowRoutes }}
        append={TopApiRoutesRenderer}
      />

      <ReportWidget
        isLoading={isLoading}
        params={params.networkTraffic}
        error={error.networkTraffic}
        title="Network Traffic"
        tooltip="Ingress and egress of requests and responses respectively"
        data={data.networkTraffic || []}
        renderer={NetworkTrafficRenderer}
      />
    </ReportPadding>
  )
}

ApiReport.getLayout = (page) => (
  <DefaultLayout>
    <ReportsLayout>{page}</ReportsLayout>
  </DefaultLayout>
)

export default ApiReport
