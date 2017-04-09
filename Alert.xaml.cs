
using System.Windows;


namespace Nevis
{
    /// <summary>
    /// Interaction logic for Alert.xaml
    /// </summary>
    public partial class Alert : Window
    {
        public Alert()
        {
            InitializeComponent();
        }

        private void OK_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }

        private void Enter_Click(object sender, RoutedEventArgs e)
        {
            ((MainWindow)Application.Current.MainWindow).password = passwordbox.Password;
            this.Close();
        }
    }
}
