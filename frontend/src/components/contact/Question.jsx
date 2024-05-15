import React from 'react'
import type { CollapseProps } from 'antd';
import { Collapse } from 'antd';



const items: CollapseProps['items'] = [
    {
      key: '1',
      label: 'Question 1 ?',
      children: <p>A dog is a type of domesticated animal.
      Known for its loyalty and faithfulness,</p>,
    },
    {
      key: '2',
      label: 'Question 2',
      children: <p>A dog is a type of domesticated animal.Known for its loyalty and faithfulness,</p>,
    },
    {
      key: '3',
      label: 'Question 3',
      children: <p>A dog is a type of domesticated animal.Known for its loyalty and faithfulness,</p>,
    },
  ];
  
function Question() {
    const onChange = (key: string | string[]) => {
        console.log(key);
      };
  return (
    <div className='question-section'>
        <Collapse items={items} defaultActiveKey={['1']} onChange={onChange} />
    </div>
  )
}

export default Question