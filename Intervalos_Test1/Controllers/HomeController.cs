using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Intervalos_Test1.Controllers
{
    public class HomeController : Controller
    {
        int rows;
        int columns;

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Error()
        {
            return View();
        }

        [HttpPost]
        public IActionResult overlapping(string Intervals)
        {
            string[,] intervals = JsonConvert.DeserializeObject<string[,]>(Intervals);
            rows = intervals.GetLength(0);
            columns = intervals.GetLength(1);

            //Se convierte el array de strings en una lista para manejar mejor los datos
            List<List<int>> arr_intervals = Convert_string_list_intervals(intervals);

            //Se compara la lista de los intervalos
            arr_intervals = Compare_intervals(arr_intervals);

            //Codificamos el resultado de la matriz en JSON
            return Json(arr_intervals);
        }

        /*Metodo que converite un array de string de 2d en una lista*/
        private List<List<int>> Convert_string_list_intervals(string[,] intervals)
        {
            List<List<int>> arr_intervals = new List<List<int>>();

            for (int i = 0; i < rows; i++)
            {
                List<int> interval = new List<int>();
                for (int a = 0; a < columns; a++)
                {
                    interval.Insert(a, Int32.Parse(intervals[i, a]));
                }
                arr_intervals.Insert(i, interval);
            }

            return arr_intervals;
        }

        /*Metodo que compara cada intervalo con los demás y los une en dado caso*/
        private List<List<int>> Compare_intervals(List<List<int>> intervals)
        {
            //Variables auxiliares
            int index_arr = 0;
            int index_root = 0;
            const int index_min = 0;
            const int index_max = 1;

            /*En este ciclo lo que se hace es que cada intervalo se compare con todos (root), si coinciden sus rangos se unen 
             * comparando el menor mínimo y el mayor máximo para que se cree el nuevo intervalo (index_arr) además de borrar 
             * la lista el intervalo que coincidió, sino coinciden se compara con el siguiente en la lista (index_arr++) hasta
             * que el root es el ultimo intervalo de la lista*/
            while (index_root < (intervals.Count - 1))
            {
                int min_next = intervals.ElementAt(index_arr + 1).ElementAt(index_min);
                int max_next = intervals.ElementAt(index_arr + 1).ElementAt(index_max);

                int min = intervals.ElementAt(index_root).ElementAt(index_min);
                int max = intervals.ElementAt(index_root).ElementAt(index_max);

                bool overlap = (min <= max_next) && (min_next <= max);

                if (overlap)
                {
                    if(min < min_next)
                        intervals[index_root][index_min] = min;
                    else
                        intervals[index_root][index_min] = min_next;

                    if(max > max_next)
                        intervals[index_root][index_max] = max;
                    else
                        intervals[index_root][index_max] = max_next;

                    intervals.RemoveAt(index_arr + 1);
                    index_arr = 0;
                    index_root = 0;
                }
                else
                {
                    index_arr++;
                }

                if(index_arr == (intervals.Count - 1))
                {
                    index_root++;
                    index_arr = index_root;
                }
            }

            //Regresamos la lista con los nuevos intervalos
            return intervals;
        }

    }
}
