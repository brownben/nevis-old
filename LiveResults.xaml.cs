using System;
using System.Linq;
using System.Windows;
using LiteDB;
using System.Timers;


namespace RocketDownload
{
    /// <summary>
    /// Interaction logic for LiveResults.xaml
    /// </summary>
    public partial class LiveResults : Window
    {
        public LiveResults()
        {
            InitializeComponent();
            CourseName.Visibility = Visibility.Hidden;
        }
        public class Entry
        {
            public int Id { get; set; }
            public string Sicard { get; set; }
            public string Name { get; set; }
            public string Course { get; set; }
            public string Class { get; set; }
            public string Club { get; set; }
            public string Start { get; set; }
            public string Time { get; set; }
            public bool Downloaded { get; set; }
            public string LastSeenAt { get; set; }
            public string LastSeenTime { get; set; }
            public Array ControlList { get; set; }
        }
        public string databaselocation = "";
        private void resultClear()
        {
            Courseentry.Dispatcher.Invoke(() =>
            {
                Results.Text = "";

            });

        }
        private void resultLog(string text)
        {
            Courseentry.Dispatcher.Invoke(() =>
            {
                Results.AppendText(text + "\n");


            });

        }
        private void Startliveresults_Click(object sender, RoutedEventArgs e)
        {
            this.Title = Courseentry.Text+" - Results";
            Startliveresults.Visibility = Visibility.Hidden;
            CourseName.Visibility = Visibility.Visible;
            Courseentry.Visibility = Visibility.Hidden;
            databaselocation = ((MainWindow)Application.Current.MainWindow).databaselocation1.Text;
            CourseName.Text = Courseentry.Text;
            var myTimer = new Timer();
            // Tell the timer what to do when it elapses
            myTimer.Elapsed += new ElapsedEventHandler(liveresults);
            // Set it to go off every five seconds
            myTimer.Interval = 10000;
            // And start it        
            myTimer.Enabled = true;
        }
        private void liveresults(object source, ElapsedEventArgs e)
        {
            resultClear();
            var counter = 1;        
            using (var db = new LiteDatabase(@databaselocation))
            {
                Courseentry.Dispatcher.Invoke(() =>
                {
                    var entries = db.GetCollection<Entry>("entries");
                    var results = entries.Find(Query.And(Query.EQ("Downloaded", true), Query.EQ("Course", CourseName.Text))).OrderBy(x => x.Time);
                    var resultlist = from result in results select result;

                    foreach (var result in resultlist)
                    {
                        resultLog(Convert.ToString(counter + ": " + result.Name + " - " + result.Class + " - " + " - " + result.Club + result.Time));
                        counter = counter + 1;
                    }
                });

            }
        }
    }


        }
    
        

   


