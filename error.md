INFO:     12.54.70.125:55072 - "POST /calculate HTTP/1.1" 500 Internal Server Error
Received Target Pressure (a): 1.0
Received Target Flowrate (b): 10.0
Received Pump Model: IH1800_N2
Received Conductance List: [ConductanceItem(type='Recommended', description='L=100cm, D=10cm'), ConductanceItem(type='Recommended', description='L=1000cm, D=20cm')]
Traceback (most recent call last):
  File "C:\python\Lib\site-packages\pandas\core\indexes\base.py", line 3805, in get_loc
    return self._engine.get_loc(casted_key)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "index.pyx", line 167, in pandas._libs.index.IndexEngine.get_loc
  File "index.pyx", line 191, in pandas._libs.index.IndexEngine.get_loc
  File "index.pyx", line 234, in pandas._libs.index.IndexEngine._get_loc_duplicates
  File "index.pyx", line 242, in pandas._libs.index.IndexEngine._maybe_get_bool_indexer
  File "index.pyx", line 134, in pandas._libs.index._unpack_bool_indexer
KeyError: 'IH1800_N2'

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "C:\Users\mgoog1.ko\Desktop\mk pumping simulator\backend\main.py", line 136, in calculate
    pump_values = df1[pump].to_numpy(dtype=np.float64)
                  ~~~^^^^^^
  File "C:\python\Lib\site-packages\pandas\core\frame.py", line 4102, in __getitem__
    indexer = self.columns.get_loc(key)
              ^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\python\Lib\site-packages\pandas\core\indexes\base.py", line 3812, in get_loc
    raise KeyError(key) from err
