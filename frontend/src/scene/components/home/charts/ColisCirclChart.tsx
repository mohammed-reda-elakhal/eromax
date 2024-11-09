import React, { useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { countColisByRole, countColisLivreByRole, countColisRetourByRole } from '../../../../redux/apiCalls/staticsApiCalls';

ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  labels: ['Liverée', 'Encours', 'Echouée'],
  datasets: [
    {
      label: '# of Votes',
      data: [106 , 36 , 90],
      backgroundColor: [
        'green',
        'yellow',
        'red',
      ],
      borderColor: [
        'green',
        'yellow',
        'red',
      ],
      borderWidth: 1,
    },
  ],
};

function ColisCirclChart() {
  const dispatch = useDispatch();
  const ColisLivreByRole = useSelector((state) => state.statics.setColisLivreByRole);
  const ColisRetourByRole = useSelector((state) => state.statics.setColisLivreByRole);
  const totalColisEncours = useSelector((state)=>state.statics.setAllColis);

  const user = useSelector(state => state.auth.user);
  const store = useSelector(state => state.auth.store);
  useEffect(() => {
    if (user && store && user.role) {
        if (user.role === "client") {
            dispatch(countColisLivreByRole(user.role, store._id));
            dispatch(countColisRetourByRole(user.role, store._id));
            dispatch(countColisByRole(user.role, store._id));


        } else if (user.role === "livreur" || user.role === "team" ||user.role === "admin" ) {
            dispatch(countColisLivreByRole(user.role, user._id));
            dispatch(countColisRetourByRole(user.role, store._id));
            dispatch(countColisByRole(user.role,user._id));


        }
    }
}, [dispatch, user, store]);
const chartData = {
  labels: ['Livrée', 'En cours', 'Echouée'],
  datasets: [
    {
      label: 'Statut des Colis',
      data: [
         ColisLivreByRole || 0, // Dynamic data from Redux for 'Livrée'
         totalColisEncours || 0,
        ColisRetourByRole||0, // Replace this with a dynamic value if available
      ],
      backgroundColor: [
        'green',
        'yellow',
        'red',
      ],
      borderColor: [
        'green',
        'yellow',
        'red',
      ],
      borderWidth: 1,
    },
  ],
};



  return (
    <div className='chart-circl-colis'>
      <Doughnut data={chartData} />
    </div>
  )
}

export default ColisCirclChart