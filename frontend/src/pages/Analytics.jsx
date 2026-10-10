import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ApiState from '../components/State'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { RISK_COLOR, RISK_LABEL } from '../utils/risk'

const LABEL = {
  days_since_maintenance: 'Days since service',
  age_years: 'Age',
  voltage_dev: 'Voltage deviation',
  previous_failures: 'Past failures',
  operating_hours: 'Nightly run time',
  temperature: 'Temperature',
  rainfall: 'Rainfall',
  maintenance_count: 'Services done',
  voltage: 'Voltage',
}

const Card = ({ title, note, children }) => (
  <section className="rounded border border-gray-200 bg-white shadow-sm p-4">
    <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
    <p className="mb-3 mt-0.5 text-xs text-gray-500">{note}</p>
    <div className="h-72">{children}</div>
  </section>
)

export default function Analytics() {
  const res = useApi(api.analytics)
  const d = res.data

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="pg-header">
        <h1 className="text-xl font-semibold text-cobalt">Analytics</h1>
        <p className="mt-0.5 text-sm text-gray-500">Distribution of risk across the network and the factors that drive it.</p>
      </div>
      <ApiState {...res}>
        {d && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card
              title="Condition by area"
              note="Streetlights per neighbourhood, grouped by current risk rating."
            >
              <ResponsiveContainer>
                <BarChart data={d.by_area}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="area" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={55} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  {['LOW', 'MEDIUM', 'HIGH', 'FAILED'].map((k) => (
                    <Bar key={k} dataKey={k} name={RISK_LABEL[k]} stackId="a" fill={RISK_COLOR[k]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card
              title="Average failure risk by age"
              note="Older fixtures statistically carry higher predicted failure probability."
            >
              <ResponsiveContainer>
                <BarChart data={d.risk_by_age}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="age" tick={{ fontSize: 11 }} unit=" y" />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                  <Tooltip formatter={(v) => `${Math.round(v * 100)}%`} />
                  <Bar dataKey="avg_risk" name="Average risk" fill="#17365D" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="lg:col-span-2">
              <Card
                title="Feature importance"
                note="Share of each prediction explained by each sensor reading (Random Forest feature importance)."
              >
                <ResponsiveContainer>
                  <BarChart
                    data={d.feature_importance.map((f) => ({ ...f, name: LABEL[f.feature] || f.feature }))}
                    layout="vertical"
                    margin={{ left: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip formatter={(v) => `${Math.round(v * 100)}%`} />
                    <Bar dataKey="importance" name="Importance" fill="#17365D" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}
      </ApiState>
    </div>
  )
}
