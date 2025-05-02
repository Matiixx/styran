import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface BurndownData {
  date: Date;
  remainingPoints: number;
  idealPoints: number;
}

interface BurndownChartProps {
  data: BurndownData[];
}

const BurndownChart = ({ data }: BurndownChartProps) => {
  const formattedData = data.map((point) => ({
    ...point,
    date: format(point.date, "MMM d"),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Burndown Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="remainingPoints"
                stroke="#8884d8"
                name="Actual"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="idealPoints"
                stroke="#82ca9d"
                name="Ideal"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BurndownChart;
