import { getDuration, startBeforeEnd } from "@/util/timecardValidation";
import { ActionIcon, Avatar, Badge, Center, Collapse, Fieldset, Group, NumberFormatter, NumberInput, Paper, SimpleGrid, Table, Textarea, TextInput, Title } from "@mantine/core";
import { TimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useToggle } from "@mantine/hooks";
import type { TimecardValues } from "@rpmp-portal/types";
import { IconChevronDown, IconChevronUp, IconRestore } from "@tabler/icons-react";

interface TimecardProps {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  timecardVals: TimecardValues;
  formErrors: Record<string, string>
  updateTimecard: (values: TimecardValues) => void;
  resetTimecard: () => void;
}

export default function Timecard({ isCollapsed, toggleCollapsed, timecardVals, formErrors, updateTimecard, resetTimecard }: TimecardProps) {
  const [variant, toggleVariant] = useToggle(["default", "filled"] as const);

  const form = useForm({
    mode: "controlled",
    initialValues: timecardVals,
    initialErrors: formErrors,
    onValuesChange: (values) => {
      updateTimecard({
        ...values,
        hasChanged: form.isDirty(),
      });
    },
    validateInputOnBlur: true,
    validate: {
      sundayStart: (value, { sundayEnd }) => startBeforeEnd(value, sundayEnd),
      sundayEnd: (value, { sundayStart }) => startBeforeEnd(sundayStart, value),
      mondayStart: (value, { mondayEnd }) => startBeforeEnd(value, mondayEnd),
      mondayEnd: (value, { mondayStart }) => startBeforeEnd(mondayStart, value),
      drivingStart: (value, { drivingEnd }) => startBeforeEnd(value, drivingEnd),
      drivingEnd: (value, { drivingStart }) => startBeforeEnd(drivingStart, value),
    }
  });

  const formValues = form.getValues();
  const badgeWidth = 90;
  const badgeSectionWidth = badgeWidth + 10;
  const employeeColor = timecardVals.displayColor ?? "blue";
  const rateInputWidth = 200;

  const handleResetClick = () => {
    resetTimecard();
    toggleVariant();
    setTimeout(() => toggleVariant(), 2000);
  }

  const updateHoursAndPay = (value: string | number, key: keyof TimecardValues) => {
    const timecardWithChange: TimecardValues = { ...timecardVals, [key]: value };
    const hoursAndPay = calculateHoursAndPay(timecardWithChange);
    form.setValues({ ...timecardWithChange, ...hoursAndPay });
  }

  return (
    <Paper>
      <Group onClick={() => {
        if (isCollapsed) toggleCollapsed();
      }}>
        <Group me={'auto'}>
          <Avatar src={timecardVals.profilePicUrl} alt={timecardVals.fullName} />
          <Title>{timecardVals.fullName}</Title>
        </Group>
        <NumberInput
          w={rateInputWidth}
          leftSection={
            <Badge c="black" color={employeeColor} w={badgeWidth}>
              Kitchen
            </Badge>
          }
          leftSectionWidth={badgeSectionWidth}
          placeholder="$0.00"
          required
          prefix="$"
          min={0}
          decimalScale={2}
          fixedDecimalScale
          hideControls
          // key={form.key(`kitchenRate`)}
          {...form.getInputProps(`kitchenRate`)}
          onChange={(value) => {
            form.getInputProps('kitchenRate').onChange(value);
            updateHoursAndPay(value, 'kitchenRate');
          }}
        />
        <NumberInput
          w={rateInputWidth}
          leftSection={
            <Badge c="black" color={employeeColor} w={badgeWidth}>
              Driving
            </Badge>
          }
          leftSectionWidth={badgeSectionWidth}
          placeholder="$0.00"
          required
          prefix="$"
          min={0}
          decimalScale={2}
          fixedDecimalScale
          hideControls
          // key={form.key(`drivingRate`)}
          {...form.getInputProps(`drivingRate`)}
          onChange={(value) => {
            form.getInputProps('drivingRate').onChange(value);
            updateHoursAndPay(value, 'drivingRate');
          }}
        />
        <ActionIcon disabled={!form.isDirty()} variant={variant} size={"lg"} onClick={handleResetClick}>
          <IconRestore />
        </ActionIcon>
        <ActionIcon variant="default" size={"lg"} onClick={() => {
          if (!isCollapsed) toggleCollapsed();
        }}>
          {isCollapsed ? <IconChevronUp /> : <IconChevronDown /> }
        </ActionIcon>
      </Group>

      <Collapse in={!isCollapsed}>
        <Fieldset pb={"xs"} legend={<Title order={3}>Sunday Kitchen</Title>}>
          <SimpleGrid cols={3} mb={"xs"}>
            <TimePicker
              leftSection={
                <Badge c="black" color={employeeColor} w={badgeWidth}>
                  Start
                </Badge>
              }
              leftSectionWidth={badgeSectionWidth}
              format="12h"
              withDropdown
              clearable
              key={form.key(`sundayStart`)}
              {...form.getInputProps(`sundayStart`)}
              onChange={(value) => {
                form.getInputProps('sundayStart').onChange(value);
                updateHoursAndPay(value, 'sundayStart');
              }}
            />
            <TimePicker
              leftSection={
                <Badge c="black" color={employeeColor} w={badgeWidth}>
                  End
                </Badge>
              }
              leftSectionWidth={badgeSectionWidth}
              format="12h"
              withDropdown
              clearable
              key={form.key(`sundayEnd`)}
              {...form.getInputProps(`sundayEnd`)}
              onChange={(value) => {
                form.getInputProps('sundayEnd').onChange(value);
                updateHoursAndPay(value, 'sundayEnd');
              }}
            />
            <TextInput
              leftSection={"Total Hours:"}
              leftSectionWidth={badgeSectionWidth}
              readOnly
              key={form.key(`sundayTotalHours`)}
              {...form.getInputProps(`sundayTotalHours`)}
            />
          </SimpleGrid>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Regular Pay</Table.Th>
                <Table.Th>Overtime Pay</Table.Th>
                <Table.Th>Total Pay</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>${formValues.sundayRegularPay.toFixed(2)}</Table.Td>
                <Table.Td
                  c={formValues.sundayOvertimePay > 0 ? "red.5" : undefined}
                >
                  ${formValues.sundayOvertimePay.toFixed(2)}
                </Table.Td>
                <Table.Td>${formValues.sundayTotalPay.toFixed(2)}</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Fieldset>

        <Fieldset pb={"xs"} legend={<Title order={3}>Monday Kitchen</Title>}>
          <SimpleGrid cols={3} mb={"xs"}>
            <TimePicker
              leftSection={
                <Badge c="black" color={employeeColor} w={badgeWidth}>
                  Start
                </Badge>
              }
              leftSectionWidth={badgeSectionWidth}
              format="12h"
              withDropdown
              clearable
              key={form.key(`mondayStart`)}
              {...form.getInputProps(`mondayStart`)}
              onChange={(value) => {
                form.getInputProps('mondayStart').onChange(value);
                updateHoursAndPay(value, 'mondayStart');
              }}
            />
            <TimePicker
              leftSection={
                <Badge c="black" color={employeeColor} w={badgeWidth}>
                  End
                </Badge>
              }
              leftSectionWidth={badgeSectionWidth}
              format="12h"
              withDropdown
              clearable
              key={form.key(`mondayEnd`)}
              {...form.getInputProps(`mondayEnd`)}
              onChange={(value) => {
                form.getInputProps('mondayEnd').onChange(value);
                updateHoursAndPay(value, 'mondayEnd');
              }}
            />
            <TextInput
              leftSection={"Total Hours:"}
              leftSectionWidth={badgeSectionWidth}
              readOnly
              key={form.key(`mondayTotalHours`)}
              {...form.getInputProps(`mondayTotalHours`)}
            />
          </SimpleGrid>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Regular Pay</Table.Th>
                <Table.Th>Overtime Pay</Table.Th>
                <Table.Th>Total Pay</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>${formValues.mondayRegularPay.toFixed(2)}</Table.Td>
                <Table.Td
                  c={formValues.mondayOvertimePay > 0 ? "red.5" : undefined}
                >
                  ${formValues.mondayOvertimePay.toFixed(2)}
                </Table.Td>
                <Table.Td>${formValues.mondayTotalPay.toFixed(2)}</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Fieldset>

        <Fieldset pb={"xs"} legend={<Title order={3}>Driving</Title>}>
          <SimpleGrid cols={3}>
            <TimePicker
              leftSection={
                <Badge c="black" color={employeeColor} w={badgeWidth}>
                  Start
                </Badge>
              }
              leftSectionWidth={badgeSectionWidth}
              format="12h"
              withDropdown
              clearable
              key={form.key(`drivingStart`)}
              {...form.getInputProps(`drivingStart`)}
              onChange={(value) => {
                form.getInputProps('drivingStart').onChange(value);
                updateHoursAndPay(value, 'drivingStart');
              }}
            />
            <TimePicker
              leftSection={
                <Badge c="black" color={employeeColor} w={badgeWidth}>
                  End
                </Badge>
              }
              leftSectionWidth={badgeSectionWidth}
              format="12h"
              withDropdown
              clearable
              key={form.key(`drivingEnd`)}
              {...form.getInputProps(`drivingEnd`)}
              onChange={(value) => {
                form.getInputProps('drivingEnd').onChange(value);
                updateHoursAndPay(value, 'drivingEnd');
              }}
            />
            <TextInput
              leftSection={"Total Hours:"}
              leftSectionWidth={badgeSectionWidth}
              readOnly
              key={form.key(`drivingTotalHours`)}
              {...form.getInputProps(`drivingTotalHours`)}
            />
            <NumberInput
              leftSection={
                <Badge c="black" color={employeeColor} w={badgeWidth}>
                  Route 1
                </Badge>
              }
              leftSectionWidth={badgeSectionWidth}
              placeholder="$0.00"
              prefix="$"
              min={0}
              decimalScale={2}
              fixedDecimalScale
              hideControls
              // key={form.key("route1")}
              {...form.getInputProps(`route1`)}
              onChange={(value) => {
                form.getInputProps('route1').onChange(value);
                updateHoursAndPay(value, 'route1');
              }}
            />
            <NumberInput
              leftSection={
                <Badge c="black" color={employeeColor} w={badgeWidth}>
                  Route 2
                </Badge>
              }
              leftSectionWidth={badgeSectionWidth}
              placeholder="$0.00"
              prefix="$"
              min={0}
              decimalScale={2}
              fixedDecimalScale
              hideControls
              // key={form.key("route2")}
              {...form.getInputProps(`route2`)}
              onChange={(value) => {
                form.getInputProps('route2').onChange(value);
                updateHoursAndPay(value, 'route2');
              }}
            />
            <NumberInput
              leftSection={
                <Badge c="black" color={employeeColor} w={badgeWidth}>
                  Stops
                </Badge>
              }
              leftSectionWidth={badgeSectionWidth}
              min={1}
              key={form.key(`stops`)}
              {...form.getInputProps(`stops`)}
              onChange={(value) => {
                form.getInputProps('stops').onChange(value);
                updateHoursAndPay(value, 'stops');
              }}
            />
          </SimpleGrid>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Cost Per Stop</Table.Th>
                <Table.Th>Total Cost</Table.Th>
                <Table.Th>Regular Pay</Table.Th>
                <Table.Th>Overtime Pay</Table.Th>
                <Table.Th>Total Pay</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td c={formValues.costPerStop > 8 ? "red.5" : undefined}>
                  ${formValues.costPerStop.toFixed(2)}
                </Table.Td>
                <Table.Td
                  c={formValues.drivingTotalCost > 0 ? "red.5" : undefined}
                >
                  {formValues.drivingTotalCost > 0
                    ? `$${formValues.drivingTotalCost.toFixed(2)}`
                    : "-"}
                </Table.Td>
                <Table.Td>${formValues.drivingRegularPay.toFixed(2)}</Table.Td>
                <Table.Td
                  c={formValues.drivingOvertimePay > 0 ? "red.5" : undefined}
                >
                  ${formValues.drivingOvertimePay.toFixed(2)}
                </Table.Td>
                <Table.Td>${formValues.drivingTotalPay.toFixed(2)}</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Fieldset>

        <Fieldset
          legend={<Title order={3}>Miscellaneous Payment</Title>}
          mb={"md"}
        >
          <Textarea
            placeholder="Enter Miscellaneous Payment description here"
            mb={"xs"}
            key={form.key(`miscDescription`)}
            {...form.getInputProps(`miscDescription`)}
          />
          <Group grow>
            <NumberInput
              leftSection={
                <Badge c="black" color={employeeColor} w={badgeWidth}>
                  Amount
                </Badge>
              }
              leftSectionWidth={badgeSectionWidth}
              placeholder="$0.00"
              prefix="$"
              min={0}
              decimalScale={2}
              fixedDecimalScale
              hideControls
              // key={form.key(`miscAmount`)}
              {...form.getInputProps(`miscAmount`)}
              onChange={(value) => {
                form.getInputProps('miscAmount').onChange(value);
                updateHoursAndPay(value, 'miscAmount');
              }}
            />
            <TextInput
              name="miscPayCode"
              leftSection={
                <Badge c="black" color={employeeColor} w={badgeWidth}>
                  Pay Code
                </Badge>
              }
              leftSectionWidth={badgeSectionWidth}
              key={form.key(`miscPayCode`)}
              {...form.getInputProps(`miscPayCode`)}
            />
          </Group>
        </Fieldset>

        <Center>
          <Title order={2}>
            Grand Total:{" "}
            {formValues.grandTotal > 0 ? (
              <NumberFormatter
                prefix="$"
                value={formValues.grandTotal}
                decimalScale={2}
              />
            ) : ("-")}
          </Title>
        </Center>
      </Collapse>
    </Paper>
  );
}
function calculateHoursAndPay(
  formValues: TimecardValues
): Record<string, number> {
  const {
    sundayStart,
    sundayEnd,
    mondayStart,
    mondayEnd,
    drivingStart,
    drivingEnd,
    kitchenRate,
    drivingRate,
    route1,
    route2,
    stops,
    miscAmount,
  } = formValues;

  let hoursAndPay: Record<string, number> = {
    sundayTotalHours: 0,
    sundayOvertimeHours: 0,
    sundayRegularPay: 0,
    sundayOvertimePay: 0,
    sundayTotalPay: 0,
    mondayTotalHours: 0,
    mondayOvertimeHours: 0,
    mondayRegularPay: 0,
    mondayOvertimePay: 0,
    mondayTotalPay: 0,
    drivingTotalHours: 0,
    drivingOvertimeHours: 0,
    drivingRegularPay: 0,
    drivingOvertimePay: 0,
    drivingTotalPay: 0,
    route1: Number(route1),
    route2: Number(route2),
    stops,
    costPerStop: 0,
    drivingTotalCost: 0,
    grandTotal: 0,
  };

  const [sundayDuration, mondayDuration, drivingDuration] = [
    [sundayStart, sundayEnd],
    [mondayStart, mondayEnd],
    [drivingStart, drivingEnd],
  ].map(([start, end]) => parseFloat(getDuration(start, end).toFixed(2)));

  if (sundayDuration > 0) {
    const overtime = Math.max(0, sundayDuration - 8);

    hoursAndPay = {
      ...hoursAndPay,
      sundayTotalHours: sundayDuration,
      sundayOvertimeHours: overtime,
      sundayRegularPay: sundayDuration * kitchenRate,
      sundayOvertimePay: overtime * 0.5 * kitchenRate,
      sundayTotalPay:
        sundayDuration * kitchenRate + overtime * 0.5 * kitchenRate,
    };
  }

  if (mondayDuration > 0 || drivingDuration > 0) {
    const mondayOvertime = Math.max(0, mondayDuration - 8);
    const drivingOvertime =
      mondayOvertime > 0
        ? drivingDuration
        : Math.max(0, mondayDuration + drivingDuration - 8);

    hoursAndPay = {
      ...hoursAndPay,
      mondayTotalHours: mondayDuration,
      mondayOvertimeHours: mondayOvertime,
      mondayRegularPay: mondayDuration * kitchenRate,
      mondayOvertimePay: mondayOvertime * 0.5 * kitchenRate,
      // Sum of the previous two
      mondayTotalPay:
        mondayDuration * kitchenRate + mondayOvertime * 0.5 * kitchenRate,
      drivingTotalHours: drivingDuration,
      drivingOvertimeHours: drivingOvertime,
      drivingRegularPay: drivingDuration * drivingRate,
      drivingOvertimePay: drivingOvertime * 0.5 * drivingRate,
      // Sum of the previous two and routes 1 and 2
      drivingTotalPay:
        drivingDuration * drivingRate +
        drivingOvertime * 0.5 * drivingRate +
        Number(route1) +
        Number(route2),
      // All driving pay divided by number of stops
      costPerStop:
        (drivingDuration * drivingRate +
          drivingOvertime * 0.5 * drivingRate +
          Number(route1) +
          Number(route2)) /
        stops,
    };
  }

  hoursAndPay.drivingTotalCost =
    stops * Math.max(0, hoursAndPay.costPerStop - 8);
  hoursAndPay.grandTotal =
    hoursAndPay.mondayTotalPay +
    hoursAndPay.sundayTotalPay +
    hoursAndPay.drivingTotalPay +
    Number(miscAmount);

  return hoursAndPay;
}