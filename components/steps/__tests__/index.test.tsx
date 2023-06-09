import React from 'react';
import Steps from '..';
import mountTest from '../../../tests/shared/mountTest';
import rtlTest from '../../../tests/shared/rtlTest';
import { render } from '../../../tests/utils';
import { resetWarned } from '../../_util/warning';

describe('Steps', () => {
  mountTest(Steps);
  rtlTest(Steps);

  const description = 'This is a description.';
  it('should render correct', () => {
    const { container } = render(
      <Steps
        items={[
          {
            title: 'Finished',
            description,
          },
          {
            title: 'In Progress',
            description,
            subTitle: 'Left 00:00:08',
          },
          {
            title: 'Waiting',
            description,
          },
        ]}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should render correct when use Step', () => {
    const { container } = render(
      <Steps>
        <Steps.Step title="Finished" description={description} />
        <Steps.Step title="In Progress" description={description} subTitle="Left 00:00:08" />
        <Steps.Step title="Waiting" description={description} />
      </Steps>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should render correct when use null', () => {
    const { container } = render(<Steps>null</Steps>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('deprecated warning', () => {
    resetWarned();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <Steps>
        <Steps.Step title="Finished" description={description} />
      </Steps>,
    );

    expect(container.querySelectorAll('.ant-steps-item')).toHaveLength(1);

    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: [antd: Steps] Step is deprecated. Please use `items` directly.',
    );
    errorSpy.mockRestore();
  });
});
