# terminal-react

# Example Usage
```c++
class TerminalView extends React.Component {
    state = {
        data: '',
        disabled: false
    }

    constructor(props) {
        super(props)
        this.state.data = fs.readFileSync('public/example_data.txt', 'utf8');
    }

    render() {
        return (
            <div id="TerminalWrapper">
                <Terminal
                    ref={term => {this.term = term;}}
                    data={this.state.data}
                    onSubmit={(ps1, text) => {
                        console.log('Submitted: ', text)
                        this.setState({
                            data: this.state.data + '\n' + ps1 + text,
                            disabled: true
                        });     
                        setTimeout(() => {
                            this.setState({disabled: false});
                            this.term.focus();
                        }, 1000)
                    }}
                    disabled={this.state.disabled}
                    PS1='ELA$&nbsp;'
                ></Terminal>
            </div>
        );
    }
}
```