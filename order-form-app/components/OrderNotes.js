import { Layout, TextField } from '@shopify/polaris';


class OrderNotes extends React.Component{
  state = { value:'' };
  render(){
    return (
      <Layout.Section>
        <TextField  
          label="Notes" 
          value={this.state.value}
          onChange={(val) => { this.setState({value: val}); }
          }
          placeholder="Add a note.." 
          autoComplete = { false } 
          autoFocus = { false }  
        />
      </Layout.Section>
    );
  } 
}

export default OrderNotes;