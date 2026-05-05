import React from 'react'

export default function ModalLoading() {
  return (
    <div className='fixed z-90 inset-0 bg-black/50 flex justify-center items-center'>
      <div className='bg-white p-4 rounded-lg shadow'>
          <p className='text-gray-700'> Cargando... </p>
      </div>
    </div>
  )
}
